// SocialLinks.tsx
import Link from 'next/link';
import {
  FaEnvelope,
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';

interface AuthorLinksProps {
  author: Author;
}

const AuthorLinks: React.FC<AuthorLinksProps> = ({ author }) => {
  return (
    <div className='flex flex-row space-x-4 text-untele/70'>
      {author.website && (
        <Link href={author.website}>
          <FaGlobe />
        </Link>
      )}
      {author.twitter && (
        <Link href={author.twitter}>
          <FaTwitter />
        </Link>
      )}
      {author.instagram && (
        <Link href={author.instagram}>
          <FaInstagram />
        </Link>
      )}
      {author.facebook && (
        <Link href={author.facebook}>
          <FaFacebook />
        </Link>
      )}
      {author.youtube && (
        <Link href={author.youtube}>
          <FaYoutube />
        </Link>
      )}
      {author.tiktok && (
        <Link href={author.tiktok}>
          <FaTiktok />
        </Link>
      )}
      {author.linkedin && (
        <Link href={author.linkedin}>
          <FaLinkedin />
        </Link>
      )}
      {author.email && (
        <Link href={`mailto:${author.email}`}>
          <FaEnvelope />
        </Link>
      )}
    </div>
  );
};

export default AuthorLinks;
