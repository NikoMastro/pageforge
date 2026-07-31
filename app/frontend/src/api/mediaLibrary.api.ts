import { requestJson } from './baseClient';

export interface CloudflareImageDetail {
  id: string;
  filename: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
}

export interface CloudflareImagesListResponse {
  result: {
    images: CloudflareImageDetail[];
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

export interface CloudflareVideoDetail {
  uid: string;
  created?: string | number;
  modified?: string | number;
  name?: string;
  thumbnail?: string;
  preview?: string;
  duration?: number;
  size?: number;
  status?: any;
  playback?: {
    hls?: string;
    dash?: string;
    [key: string]: any;
  } | null;
  [key: string]: any;
}

export interface CloudflareVideosListResponse {
  result: CloudflareVideoDetail[];
  success: boolean;
  errors: any[];
  messages: any[];
}

export interface UploadMediaResult {
  success: boolean;
  message?: string;
  item?: import('../types/ui.types').MediaItem;
}

const toMediaItemFromImage = (
  cfImage: CloudflareImageDetail
): import('../types/ui.types').MediaItem => {
  const publicUrl = cfImage.variants?.[0] || '';
  const extension = cfImage.filename.toLowerCase().split('.').pop() || '';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi'];

  let type: 'image' | 'video' = 'image';
  if (videoExtensions.includes(extension)) {
    type = 'video';
  } else if (!imageExtensions.includes(extension)) {
    type = 'image';
  }

  return {
    id: cfImage.id,
    name: cfImage.filename,
    type,
    url: publicUrl,
    thumbnail: publicUrl,
    createdAt: new Date(cfImage.uploaded),
    filename: cfImage.filename,
    variants: cfImage.variants,
    requireSignedURLs: cfImage.requireSignedURLs,
  };
};

const toMediaItemFromVideo = (
  video: CloudflareVideoDetail
): import('../types/ui.types').MediaItem => {
  const uid = video.uid || (video as any).id || '';
  const name = video.name || uid;
  const url =
    (video.playback &&
      (video.playback.hls || (video.playback as any).hlsUrl)) ||
    video.preview ||
    '';
  const thumbnail =
    video.thumbnail ||
    (uid
      ? `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg?time=1s`
      : undefined);

  const createdRaw = video.created ?? video.modified ?? Date.now();
  const createdAt =
    typeof createdRaw === 'number'
      ? new Date(createdRaw < 10_000_000_000 ? createdRaw * 1000 : createdRaw)
      : new Date(createdRaw);

  return {
    id: uid,
    name,
    type: 'video',
    url,
    thumbnail,
    createdAt,
    size: typeof video.size === 'number' ? video.size : undefined,
    filename: name,
    variants: undefined,
    requireSignedURLs: undefined,
  };
};

export function listCloudflareImages(): Promise<CloudflareImagesListResponse> {
  return requestJson<CloudflareImagesListResponse>('/cloudflare/listImages');
}

export function getCloudflareImage(
  imageId: string
): Promise<CloudflareImageDetail> {
  return requestJson<CloudflareImageDetail>(
    `/cloudflare/images/${encodeURIComponent(imageId)}`
  );
}

export function listCloudflareVideos(): Promise<CloudflareVideosListResponse> {
  return requestJson<CloudflareVideosListResponse>('/cloudflare/listVideos');
}

export function getCloudflareVideo(
  videoId: string
): Promise<CloudflareVideoDetail> {
  return requestJson<CloudflareVideoDetail>(
    `/cloudflare/videos/${encodeURIComponent(videoId)}`
  );
}

export async function getLibraryMedia(): Promise<
  import('../types/ui.types').MediaItem[]
> {
  try {
    const [imagesRes, videosRes] = await Promise.allSettled([
      listCloudflareImages(),
      listCloudflareVideos(),
    ]);

    const imageItems: import('../types/ui.types').MediaItem[] =
      imagesRes.status === 'fulfilled' &&
        imagesRes.value.success &&
        imagesRes.value.result?.images
        ? imagesRes.value.result.images.map(toMediaItemFromImage)
        : [];

    const videoItems: import('../types/ui.types').MediaItem[] =
      videosRes.status === 'fulfilled' &&
        videosRes.value.success &&
        Array.isArray(videosRes.value.result)
        ? videosRes.value.result.map(toMediaItemFromVideo)
        : [];

    return [...imageItems, ...videoItems].sort(
      (a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0)
    );
  } catch (error) {
    console.error('Failed to fetch library media:', error);
    return [];
  }
}

export function getLibraryImages(): Promise<
  import('../types/ui.types').MediaItem[]
> {
  return getLibraryMedia();
}

export async function uploadEditedMedia(params: {
  file: Blob;
  filename: string;
  mediaType: 'image' | 'video' | 'snapshot';
}): Promise<UploadMediaResult> {
  try {
    if (params.mediaType === 'image' || params.mediaType === 'snapshot') {
      const fd = new FormData();
      fd.append('files', params.file, params.filename);
      const res = await requestJson<any>(`/cloudflare/uploadImageFromFiles`, {
        method: 'POST',
        body: fd,
      });
      const first = Array.isArray(res)
        ? res[0]
        : res?.result?.[0] || res?.result || res;
      const item =
        first && first.id
          ? toMediaItemFromImage({
            id: first.id,
            filename: first.filename || params.filename,
            uploaded: first.uploaded || new Date().toISOString(),
            requireSignedURLs: !!first.requireSignedURLs,
            variants: first.variants || [],
          })
          : undefined;
      return { success: true, message: 'Uploaded edited media', item };
    }
    return {
      success: false,
      message: 'Video editing upload not supported yet',
    };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Upload failed' };
  }
}

export function uploadImageFromUrl(urlStr: string): Promise<any> {
  return requestJson<any>(`/cloudflare/uploadImageFromUrl`, {
    method: 'POST',
    body: JSON.stringify({ url: urlStr }),
  });
}

const buildFormData = (files: File[] | FileList | Blob[], key: 'files' | 'file') => {
  const fd = new FormData();
  const arr: any[] = Array.isArray(files) ? files : Array.from(files as any);
  for (const f of arr) {
    const name = (f as File).name || 'upload.bin';
    fd.append(key, f as any, name);
  }
  return fd;
};

export async function uploadImagesFromFiles(
  files: File[] | FileList | Blob[]
): Promise<any[]> {
  try {
    const res = await requestJson<any>(`/cloudflare/uploadImageFromFiles`, {
      method: 'POST',
      body: buildFormData(files, 'files'),
    });
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.result)) return res.result;
    if (res?.result) return [res.result];
    return [res];
  } catch {
    const res = await requestJson<any>(`/cloudflare/uploadImageFromFiles`, {
      method: 'POST',
      body: buildFormData(files, 'file'),
    });
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.result)) return res.result;
    if (res?.result) return [res.result];
    return [res];
  }
}

export function updateImage(
  imageId: string,
  patch: Partial<{ requireSignedURLs: boolean } & Record<string, any>>
): Promise<any> {
  return requestJson<any>(
    `/cloudflare/updateImage/${encodeURIComponent(imageId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(patch || {}),
    }
  );
}

export function deleteImage(imageId: string): Promise<any> {
  return requestJson<any>(
    `/cloudflare/deleteImage/${encodeURIComponent(imageId)}`,
    {
      method: 'DELETE',
    }
  );
}

export async function replaceImageContent(
  oldImageId: string,
  file: Blob,
  filename: string
): Promise<UploadMediaResult> {
  try {
    const uploaded = await uploadImagesFromFiles([
      new File([file], filename, {
        type: (file as any).type || 'application/octet-stream',
      }),
    ]);
    const first = Array.isArray(uploaded) ? uploaded[0] : uploaded;
    try {
      await deleteImage(oldImageId);
    } catch {
      /* ignore delete failure */
    }
    const item =
      first && first.id
        ? toMediaItemFromImage({
          id: first.id,
          filename: first.filename || filename,
          uploaded: first.uploaded || new Date().toISOString(),
          requireSignedURLs: !!first.requireSignedURLs,
          variants: first.variants || [],
        })
        : undefined;
    return { success: true, message: 'Replaced image content', item };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Replace failed' };
  }
}
