/* eslint-disable react/function-component-definition */
import Image from 'next/image';

function Logo(props: { renderDefault: () => React.ReactNode }) {
  const { renderDefault } = props;

  return (
    <div className='flex items-center space-x-2'>
      <Image
        src='/Logo.png'
        width={75}
        height={75}
        alt='Logo'
        // className='object-cover'
      />
      {renderDefault && <>{renderDefault()}</>}
    </div>
  );
}

export default Logo;
