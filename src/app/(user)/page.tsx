/* eslint-disable react/function-component-definition */
import { previewData } from 'next/headers';


export default function Home() {
  
  if (previewData()) {
    return (
      <div>
        This is preview Mode
      </div>
    )
  }

  return (
    <div>
      <h1>Regular View</h1>
    </div>
  );
}
