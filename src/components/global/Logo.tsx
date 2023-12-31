import Image from 'next/image';

const Logo = (props: any) => {
  const { renderDefault, title } = props;
  return (
    <div className='flex items-center space-x-2'>
      <Image
        src='/Logo.png'
        width={40}
        height={40}
        alt={title}
        className='object-cover'
      />
      {renderDefault && <>{renderDefault(props)}</>}
    </div>
  );
};

export default Logo;
