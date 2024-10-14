import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  // 检查 Accept 头，如果客户端期望 JSON，则返回 JSON
  const acceptHeader = request.headers.get("Accept");
  if (acceptHeader && acceptHeader.includes("application/json")) {
    return json({ message: "Hello World" }, {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  // 如果客户端没有明确要求 JSON，我们返回一个普通的文本响应
  return new Response("Hello World", {
    headers: {
      "Content-Type": "text/plain"
    }
  });
};

// 保留原有的默认导出组件，以确保兼容性
export default function Hello() {
  return null;
}

// 添加一个处理函数来防止 HTML 渲染
export const handle = {
  renderToString: () => null
};