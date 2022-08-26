import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';

import * as FS from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import WebView from 'react-native-webview';

/* Returns FEN code of a piece */
function getFENcode(piece) {
	const color = piece.startsWith('White') ? 'w' : 'b';
	piece = piece.replace('White', '').replace('Black', '');
	const map = {
		Pawn: 'P',
		Rook: 'R',
		Knight: 'N',
		Bishop: 'B',
		Queen: 'Q',
		King: 'K',
	};
	let fenCode = map[piece];
	if (color === 'b') {
		// black pieces are lowercase
		fenCode = fenCode.toLowerCase();
	}
	return fenCode;
}

function convertToFen(board, colorTurn) {
	let pos = '';
	// 1. Adds position
	for (let row = 0; row < 8; row++) {
		let rowVal = '';
		let runningBlank = 0;
		for (let col = 0; col < 8; col++) {
			if (board[row][col]) {
				if (runningBlank > 0) {
					rowVal += runningBlank;
					runningBlank = 0;
				}
				rowVal += getFENcode(board[row][col]);
			} else {
				runningBlank++;
			}
		}
		if (runningBlank > 0) {
			rowVal += runningBlank;
		}
		pos += rowVal + (row < 7 ? '/' : ' ');
	}
	pos += colorTurn === 'white' ? 'w' : 'b'; // 2. Adds color turn
	return pos;
}

function Camera() {
	// The path of the picked image
	const [pickedImagePath, setPickedImagePath] = useState('');
	const [base64Image, setBase64Image] = useState('');
	const [gameFen, setGameFen] = useState('');

	// const url = 'http://192.168.1.65:5000/api';
	const url = '0.0.0.0:5000/api';
	const path_image = 'frontend/IMG_20220118_210009652.jpg';

	// fetch parsed image from opencv
	useEffect(() => {
		async function fetchData() {
			const rawResponse = await fetch(url, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': url,
					'Access-Control-Allow-Credentials': 'true',
				},
				body: JSON.stringify({
					// image_path: path_image,
					image_path: pickedImagePath,
					base_64_image: base64Image,
				}),
			});

			const content = await rawResponse.json();
			const squares = content.squares;
			const pieces = content.pieces;

			const square_center_xs = squares[0];
			const square_center_ys = squares[1];

			console.log('squares', squares);
			// console.log('pieces', pieces);

			// default empty board
			const board = Array(8)
				.fill(null)
				.map(() => Array(8).fill(''));

			const number_rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
			const letter_cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

			// average the left/right x and top/bottom y coordinates of each piece
			// to get center coordinates and then use them to put them on a square
			const pieces_square_rows = [];
			const pieces_square_cols = [];
			const piece_types = []; // whiteQueen, blackRook, etc.

			for (let i = 0; i < pieces.length; i++) {
				const piece = pieces[i];
				// each piece is a Detection object stored as a string so find
				// location of words like "left", "right" etc. and parse it

				// each regex finds the word and the number after it and
				// extracts the number (which is in group 1)
				const left_regex = /left=(\d*)/;
				const left_x = Number(left_regex.exec(piece)[1]);
				const right_regex = /right=(\d*)/;
				const right_x = Number(right_regex.exec(piece)[1]);
				const top_regex = /top=(\d*)/;
				const top_y = Number(top_regex.exec(piece)[1]);
				const bottom_regex = /bottom=(\d*)/;
				const bottom_y = Number(bottom_regex.exec(piece)[1]);

				const center_x = (left_x + right_x) / 2;
				const center_y = (top_y + bottom_y) / 2;

				let closest_square_i = 0;
				let closest_square_j = 0;
				let closest_square_distance = Infinity;
				// loop over square centers to find the closest one
				for (let i = 0; i < square_center_xs.length; i++) {
					for (let j = 0; j < square_center_xs.length; j++) {
						const square_center_x = square_center_xs[i][j];
						const square_center_y = square_center_ys[i][j];

						// calculate euclidean distance between center and square center
						const distance = Math.sqrt(
							Math.pow(center_x - square_center_x, 2) +
								Math.pow(center_y - square_center_y, 2)
						);

						if (distance < closest_square_distance) {
							closest_square_i = i;
							closest_square_j = j;
							closest_square_distance = distance;
						}
					}
				}

				// approximate piece's coordinates on the board
				// round down if > 7 (off the board)
				const letter_of_square = letter_cols[Math.min(closest_square_j, 7)];
				const number_of_square = number_rows[Math.min(closest_square_i, 7)];

				pieces_square_rows.push(letter_of_square);
				pieces_square_cols.push(number_of_square);

				// also extract the type of piece (whiteQueen, blackRook, etc.)
				const piece_type_regex = /label='(\w*)'/;
				const piece_type = piece_type_regex.exec(piece)[1];

				board[Math.min(closest_square_i, 7)][Math.min(closest_square_j, 7)] =
					piece_type;

				piece_types.push(piece_type);
			}

			console.log(pieces_square_rows);
			console.log(pieces_square_cols);
			console.log(piece_types);

			const boardFen = convertToFen(board, 'white');

			setGameFen(boardFen);

			console.log('board', board);
			console.log('FEN: ', boardFen);
		}
		fetchData();
	}, [pickedImagePath]);

	// This function is triggered when the "Select an image" button pressed
	const showImagePicker = async () => {
		// Ask the user for the permission to access the media library
		const permissionResult =
			await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (permissionResult.granted === false) {
			alert("You've refused to allow this app to access your photos!");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync();

		// Explore the result
		// console.log(result);

		if (!result.cancelled) {
			let base64 = await FS.readAsStringAsync(result.uri, {
				encoding: FS.EncodingType.Base64,
			});
			setBase64Image(base64);
			setPickedImagePath(result.uri);
			console.log(result.uri);
			// console.log('base64', base64);
		}
	};

	// This function is triggered when the "Open camera" button pressed
	const openCamera = async () => {
		// Ask the user for the permission to access the camera
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

		if (permissionResult.granted === false) {
			alert("You've refused to allow this app to access your camera!");
			return;
		}

		const result = await ImagePicker.launchCameraAsync();

		// Explore the result
		console.log(result);

		if (!result.cancelled) {
			setPickedImagePath(result.uri);
			console.log(result.uri);
		}
	};

	const uriToBase64 = async (uri) => {
		let base64 = await FS.readAsStringAsync(uri, {
			encoding: FS.EncodingType.Base64,
		});
		return base64;
	};

	return (
		// <Chessboard fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" />
		<View style={styles.screen}>
			{/* <WebView source={
				{ uri: 'https://doubtfulcoder.github.io/chess-fen/' }} /> */}
			<View style={styles.buttonContainer}>
				<Button onPress={showImagePicker} title="Select an image" />
				<Button onPress={openCamera} title="Open camera" />
			</View>

			<View style={styles.imageContainer}>
				{pickedImagePath !== '' && (
					<>
						{/* <Chessboard fen={gameFen} /> */}
						<WebView
							source={{
								uri: `https://doubtfulcoder.github.io/chess-fen/?${gameFen}`,
							}}
							style={{ width: 320, flex: 1 }}
						/>
						{/* <Image source={{ uri: pickedImagePath }} style={styles.image} /> */}
						{/* <Image source={require('./assets/result.png')} /> */}
					</>
				)}
			</View>
		</View>
	);
}

// Just some styles
const styles = StyleSheet.create({
	screen: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonContainer: {
		width: 400,
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	imageContainer: {
		padding: 30,
	},
	image: {
		width: 400,
		height: 300,
		resizeMode: 'cover',
	},
});

export default Camera;
