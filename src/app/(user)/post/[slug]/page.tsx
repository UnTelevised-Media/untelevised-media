/* eslint-disable react/function-component-definition */
export default function Page({ params }: { params: { slug: string } }) {
  return <div>My Post: {params.slug}</div>}