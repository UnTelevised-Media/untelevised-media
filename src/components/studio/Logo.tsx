import Image from 'next/image';

function Logo(props: { renderDefault: () => React.ReactNode }) {
  const { renderDefault } = props;

  return (
    <div className='flex items-center space-x-2'>
      <Image
        src='/Logo.webp'
        width={75}
        height={75}
        alt='Logo'
        unoptimized
        // className='object-cover'
      />
      {renderDefault && <>{renderDefault()}</>}
    </div>
  );
}

export default Logo;
