/* eslint-disable react/function-component-definition */
type Props = {
  posts: Post[];
};

function BlogList({ posts }: Props) {
  // console.log("🚀 ~ BlogList.tsx: ~~ posts:", posts)

  return (
    <div>
      <hr className='mb-10 border-untele' />
      <div>
        {/* Post */}
        {posts.map((post) => (
          <div key={post._id}>
            <h1>{post.title}</h1>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlogList;
