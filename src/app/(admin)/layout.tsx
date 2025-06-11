// src/app/(admin)/layout.tsx
import '../globals.css';
export const metadata = {
  title: 'UnTelevised Media Studio',
};

const StudioLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='flex min-h-screen flex-col'>
      <main className='flex-grow'>{children}</main>
    </div>
  );
};

export default StudioLayout;
