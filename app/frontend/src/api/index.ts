export * from './baseClient';
export * from './firestoreParsers';
export * from './landingPages.api';
export * from './configurations.api';
export * from './linkBioPages.api';
export * from './mediaLibrary.api';
export {
  generateVideo,
  iterateVideo,
  getVideoStatus,
  getCloudflareImageUrl,
} from './videoGeneration.api';
export * from './iap.api';
export * from './landingPagesMapper';

import * as landingPagesApi from './landingPages.api';
import * as configurationsApi from './configurations.api';
import * as linkBioApi from './linkBioPages.api';
import * as mediaLibraryApi from './mediaLibrary.api';
import * as iapApi from './iap.api';
import * as experimentsApi from './experiments.api';

export const pageforgeApi = {
  // Landing Pages
  saveToFirestore: landingPagesApi.saveToFirestore,
  deployToGCS: landingPagesApi.deployToGCS,
  getLandingPageNames: landingPagesApi.getLandingPageNames,
  getLandingPageLatest: landingPagesApi.getLandingPageLatest,
  getLandingPageHistory: landingPagesApi.getLandingPageHistory,
  getJsonFromFirestore: landingPagesApi.getJsonFromFirestore,
  deleteLandingPage: landingPagesApi.deleteLandingPage,

  // Configurations
  saveConfig: configurationsApi.saveConfig,
  getAllConfigs: configurationsApi.getAllConfigs,
  getConfig: configurationsApi.getConfig,
  getConfigHistory: configurationsApi.getConfigHistory,
  deleteConfig: configurationsApi.deleteConfig,
  deleteConfigByName: configurationsApi.deleteConfigByName,

  // LinkBio
  saveLinkBio: linkBioApi.saveLinkBio,
  getLinkBioLatest: linkBioApi.getLinkBioLatest,
  getLinkBioHistory: linkBioApi.getLinkBioHistory,
  listLinkBios: linkBioApi.listLinkBios,
  deployLinkBio: linkBioApi.deployLinkBio,
  deleteLinkBio: linkBioApi.deleteLinkBio,

  // Media library
  listCloudflareImages: mediaLibraryApi.listCloudflareImages,
  getCloudflareImage: mediaLibraryApi.getCloudflareImage,
  listCloudflareVideos: mediaLibraryApi.listCloudflareVideos,
  getCloudflareVideo: mediaLibraryApi.getCloudflareVideo,
  getLibraryImages: mediaLibraryApi.getLibraryImages,
  getLibraryMedia: mediaLibraryApi.getLibraryMedia,
  uploadEditedMedia: mediaLibraryApi.uploadEditedMedia,
  uploadImageFromUrl: mediaLibraryApi.uploadImageFromUrl,
  uploadImagesFromFiles: mediaLibraryApi.uploadImagesFromFiles,
  updateImage: mediaLibraryApi.updateImage,
  deleteImage: mediaLibraryApi.deleteImage,
  replaceImageContent: mediaLibraryApi.replaceImageContent,

  // IAP
  getIAPUserInfo: iapApi.getIAPUserInfo,

  // Experiments
  deleteExperiment: experimentsApi.deleteExperiment,
};

export default pageforgeApi;
