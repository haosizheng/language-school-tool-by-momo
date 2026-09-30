import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 客户端轻量图片压缩与格式标准化（转为 1600px 以内的高清晰度 JPEG）
 * 极大加快上传速度（从 10MB 压至 300KB），消除大模型视觉处理超时与卡死
 */
export async function compressImage(file: File, maxDimension = 1600, quality = 0.85): Promise<File> {
  if (typeof window === "undefined") return file;

  return new Promise((resolve) => {
    // 若图片本就小于 400KB 且是标准 jpeg/png，直接跳过压缩
    if (file.size < 400 * 1024 && (file.type === "image/jpeg" || file.type === "image/png")) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
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
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], "compressed_textbook.jpg", {
            type: "image/jpeg",
          });
          resolve(compressed);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
