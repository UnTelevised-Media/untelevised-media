

const EventMap = () => {

const sizes = {
  xxl: { width: '1550px', height: '900px' },
  xl: { width: '1150px', height: '800px' },
  lg: { width: '940px', height: '600px' },
  md: { width: '675px', height: '500px' },
  sm: { width: '450px', height: '340px' },
};




  return (
    <>
      <div className='flex md:hidden items-center justify-center rounded-lg border border-untele'>
        <iframe
          style={{
            width: sizes.sm.width,
            height: sizes.sm.height,
            border: '0px',
          }}
          src='https://israelpalestine.liveuamap.com/'
          title='Live Map'
          color='dark'
          className='rounded-lg'
        />
      </div>
      <div className='md:flex hidden lg:hidden items-center justify-center rounded-lg border border-untele'>
        <iframe
          style={{
            width: sizes.md.width,
            height: sizes.md.height,
            border: '0px',
          }}
          src='https://israelpalestine.liveuamap.com/'
          title='Live Map'
          color='dark'
          className='rounded-lg'
        />
      </div>
      <div className='xl:hidden lg:flex hidden items-center justify-center rounded-lg border border-untele'>
        <iframe
          style={{
            width: sizes.lg.width,
            height: sizes.lg.height,
            border: '0px',
          }}
          src='https://israelpalestine.liveuamap.com/'
          title='Live Map'
          color='dark'
          className='rounded-lg'
        />
      </div>
      <div className='xl:flex hidden 2xl:hidden items-center justify-center rounded-lg border border-untele'>
        <iframe
          style={{
            width: sizes.xl.width,
            height: sizes.xl.height,
            border: '0px',
          }}
          src='https://israelpalestine.liveuamap.com/'
          title='Live Map'
          color='dark'
          className='rounded-lg'
        />
      </div>
      <div className='2xl:flex hidden items-center justify-center rounded-lg border border-untele'>
        <iframe
          style={{
            width: sizes.xxl.width,
            height: sizes.xxl.height,
            border: '0px',
          }}
          src='https://israelpalestine.liveuamap.com/'
          title='Live Map'
          color='dark'
          className='rounded-lg'
        />
      </div>
    </>
  );
};

export default EventMap;
