import { StyleSheet } from 'react-native';
import Camera from './Camera.js';

// import DefaultImage from '/home/naveed/Desktop/Opencv react/frontend/bishop-lines.png';

// const DEFAULT_IMAGE = Image.resolveAssetSource(DefaultImage).uri;

// console.log(DEFAULT_IMAGE);

export default function App() {
	// const url = 'http://192.168.1.65:5000/api';
	// // const path_image =
	// // 	'https://user-images.githubusercontent.com/44420281/182008063-8c84d02f-955e-49e4-8786-78caccb964a7.jpg';
	// const path_image = 'frontend/IMG_20220118_210009652.jpg';

	// useEffect(() => {
	// 	async function fetchData() {
	// 		const rawResponse = await fetch(url, {
	// 			method: 'POST',
	// 			headers: {
	// 				Accept: 'application/json',
	// 				'Content-Type': 'application/json',
	// 				'Access-Control-Allow-Origin': url,
	// 				'Access-Control-Allow-Credentials': 'true',
	// 			},
	// 			body: JSON.stringify({
	// 				image_path: path_image,
	// 			}),
	// 		});

	// 		const content = await rawResponse.json();
	// 		// console.log(content);
	// 	}
	// 	fetchData();

	// 	// async function fetchAh() {
	// 	// 	const rawResponse = await fetch(url);
	// 	// 	const content = await rawResponse.json();
	// 	// 	console.log(content);
	// 	// }

	// 	// fetchAh();
	// }, []);

	return (
		// <View style={styles.container}>
		// 	<Camera />
		// 	<Text>Open up App.js to start working on your app!</Text>
		// 	{/* <Image source={{ uri: DEFAULT_IMAGE }} /> */}
		// 	{/* <Image source={require('./bishop-lines.png')} /> */}
		// 	<Image
		// 		source={require('/home/naveed/Desktop/Opencv react/frontend/assets/result.png')}
		// 	/>
		// 	<StatusBar style="auto" />
		// </View>
		<Camera />
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
