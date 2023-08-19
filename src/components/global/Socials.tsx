import { SocialIcon } from 'react-social-icons';

const Socials = () => {
  return (
    <div className='flex items-center gap-x-4 text-xl'>
      <SocialIcon url='https://www.youtube.com/@UnTelevised' />
      <SocialIcon url='https://twitter.com/UnTelevisedLive' />
      <SocialIcon url='https://www.twitch.tv/untelevised' />
      <SocialIcon url='https://www.instagram.com/untelevised.media/' />
      <SocialIcon url='https://www.facebook.com/UnTelevisedLive' />
      <SocialIcon url='https://www.reddit.com/r/UnTelevisedMedia/' />
      <SocialIcon url='https://discord.gg/w9vMH5zr6j' />
    </div>
  );
};

export default Socials;
