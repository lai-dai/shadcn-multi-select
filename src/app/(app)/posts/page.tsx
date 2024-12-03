import Link from "next/link"
import { GetAllPosts } from "~/lib/posts"

export default function PostPage() {
  const posts = GetAllPosts()
  return (
    <div className={"mx-auto py-6"}>
      <div className={"flex flex-col gap-3"}>
        {posts.map((post, key) => (
          <Link
            className={"hover:underline"}
            href={`/posts/${post.slug}`}
            key={key}>
            {post.data.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
