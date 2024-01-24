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
      <div className='flex items-center justify-center rounded-lg border border-untele md:hidden'>
        <iframe
          style={{
            width: sizes.sm.width,
            height: sizes.sm.height,
            border: '0px',
            filter: 'invert(80%)',
          }}
          src='https://israelpalestine.liveuamap.com/'
          title='Live Map'
          color='dark'
          className='rounded-lg'
        />
      </div>
      <div className='hidden items-center justify-center rounded-lg border border-untele md:flex lg:hidden'>
        <iframe
          style={{
            width: sizes.md.width,
            height: sizes.md.height,
            border: '0px',
            filter: 'invert(80%)',
          }}
          src='https://israelpalestine.liveuamap.com/'
          title='Live Map'
          color='dark'
          className='rounded-lg'
        />
      </div>
      <div className='hidden items-center justify-center rounded-lg border border-untele lg:flex xl:hidden'>
        <iframe
          style={{
            width: sizes.lg.width,
            height: sizes.lg.height,
            border: '0px',
            filter: 'invert(80%)',
          }}
          src='https://israelpalestine.liveuamap.com/'
          title='Live Map'
          color='dark'
          className='rounded-lg'
        />
      </div>
      <div className='hidden items-center justify-center rounded-lg border border-untele xl:flex 2xl:hidden'>
        <iframe
          style={{
            width: sizes.xl.width,
            height: sizes.xl.height,
            border: '0px',
            filter: 'invert(80%)',
          }}
          src='https://israelpalestine.liveuamap.com/'
          title='Live Map'
          color='dark'
          className='rounded-lg'
        />
      </div>
      <div className='relative hidden items-center justify-center rounded-lg border border-untele 2xl:flex'>
        <iframe
          style={{
            width: sizes.xxl.width,
            height: sizes.xxl.height,
            border: '0px',
            filter: 'invert(80%)',
          }}
          src='https://israelpalestine.liveuamap.com/'
          title='Live Map'
          color='dark'
          className='rounded-lg'
        />
      </div>
      {/* <div
        className='hidden 2xl:flex rounded-lg'
        style={{
          width: sizes.xxl.width,
          height: sizes.xxl.height,
          position: 'absolute', // Position the red overlay
          top: '1216px',
          backgroundColor: 'red', // Set the background color to red
          opacity: '0.25', // Set the opacity if you want it to be semi-transparent
          zIndex: '2', // Set a lower z-index than the iframe to overlay it
        }}
      /> */}
    </>
  );
};

export default EventMap;
