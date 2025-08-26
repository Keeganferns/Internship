import { uploadSampleHotels } from './utils/uploadSampleHotels.js';

uploadSampleHotels().then(() => {
  console.log('Done!');
  process.exit(0);
}); 