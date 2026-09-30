import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 客户端轻量图片压缩与格式标准化（转为 1600px 以内的高清晰度 JPEG Blob）
 * 高兼容性设计：完全避免使用在部分移动端 WebKit 下容易抛错的 new File() 构造函数
 * 若遇到任何浏览器限制（如特定 WebKit 异常），自动优雅回退使用原始 File
 */
export async function compressImage(file: File, maxDimension = 1600, quality = 0.85): Promise<Blob | File> {
  if (typeof window === "undefined") return file;

  // 若图片已足够小（< 400KB）且是标准 jpeg/png，直接无需压缩
  if (file.size < 400 * 1024 && (file.type === "image/jpeg" || file.type === "image/png")) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        try {
          URL.revokeObjectURL(url);
          let { width, height } = img;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        } catch (e) {
          console.warn("[SnapWord] Canvas 压缩降级:", e);
          resolve(file);
        }
      };

      img.onerror = () => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
        resolve(file);
      };

      img.src = url;
    } catch (e) {
      console.warn("[SnapWord] 图片读取降级:", e);
      resolve(file);
    }
  });
}
