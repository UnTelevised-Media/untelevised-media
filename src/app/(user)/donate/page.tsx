import React from 'react';
import Image from 'next/image';

const Donate = () => {
  return (
    <>
    <hr className='mx-auto mb-8 max-w-[95wv] border-untele md:max-w-[85vw]' />
    <div className='mx-30 mt-12 flex flex-col items-center justify-center'>
      <Image src='/sim.png' alt='' width={520} height={50} />
      <p className='rounded-md border border-untele/30 bg-slate-500 p-5 my-5 shadow-lg'>
        The continued existence and success of our platform owe its existence to
        the invaluable contributions made by our dedicated viewers and readers.
        Their unwavering support, whether in the form of financial donations or
        the provision of various essential resources, is what enables us to not
        only maintain this media outlet but also to ensure the seamless
        operation of all our endeavors. It is with the deepest gratitude that we
        acknowledge and cherish every form of support, regardless of its
        magnitude, that we are fortunate enough to receive. Each act of
        generosity, whether grand or modest, plays an integral role in
        sustaining the vitality of our mission, and we remain profoundly
        thankful for each and every gesture of kindness and assistance that
        comes our way.
      </p>
      <div className='mb-8 text-left'>
        <h5 className='bold underline'>
          We currently accept donations through the following venues:
        </h5>
        <a
          href='https://cash.app/$UnTelevisedMedia'
          className='text-untele underline'
        >
          CashApp: $UnTelevisedMedia <br />
        </a>
        <a
          href='https://paypal.me/UnTelevised'
          className='text-untele underline'
        >
          Paypal: @UnTelevised <br />
        </a>
        <a
          href='https://venmo.com/UnTelevised'
          className='text-untele underline'
        >
          Venmo: @UnTelevised <br />
        </a>
      </div>
      If you wish to make a larger contribution or donate gear and equipment
      please contact us via email @{' '}
      {/* <a
        href='mailto:donate@untelevised.media'
        className='text-untele underline mb-4'
      >
        Donate@UnTelevised.Media
      </a> */}
      <a
        href='mailto:UnTelevisedMedia.Live@gmail.com'
        className='text-untele underline mb-4'
      >
        UnTelevisedMedia.Live@gmail.com
      </a>
    </div>
    </>
  );
};

export default Donate;
