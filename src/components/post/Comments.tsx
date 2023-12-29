'use client';
/* eslint-disable react/function-component-definition */
import { useForm, SubmitHandler } from 'react-hook-form';
import { client } from '@/l/sanity.client';

type Props = {
  post: Post;
};

type Input = {
  _id: string;
  name: string;
  email: string;
  comment: string;
};

function Comments({ post }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input>();

  const onSubmit: SubmitHandler<Input> = (data) => {
    client
      .create({
        _type: 'comment',
        post: {
          _type: 'reference',
          _ref: data._id,
        },
        name: data.name,
        email: data.email,
        comment: data.comment,
      })
      .then(() => {
        console.log('Submitted: ', data);
      })
      .catch((err) => {
        console.log('Not submitted: ', err);
      });
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='mx-auto my-10 mb-10 flex max-w-2xl flex-col p-5'
      >
        <h1 className='text-3xl font-bold'>
          Join the discussion on this article.
        </h1>
        <p className='text-xs font-light'>
          This feature is not yet fully functional sorry.
        </p>
        <input
          {...register('name', { required: true })}
          className='form-input mt-1 block w-full rounded border border-gray-400 bg-transparent px-3 py-2 shadow'
          placeholder='Your name'
          type='text'
        />
        <input
          {...register('email', { required: true })}
          className='form-input mt-1 block w-full rounded border border-gray-400 bg-transparent px-3 py-2 shadow'
          placeholder='Your email'
          type='email'
        />
        <textarea
          {...register('comment', { required: true })}
          className='form-input mt-1 block w-full rounded border border-gray-400 bg-transparent px-3 py-2 shadow'
          placeholder='Your comment'
          rows={8}
        />
        <input {...register('_id')} type='hidden' name='_id' value={post._id} />
        <div className='flex flex-col p-5'>
          {errors.name && (
            <span className='text-red-500'>The name field is required!</span>
          )}
          {errors.email && (
            <span className='text-red-500'>The email field is required!</span>
          )}
          {errors.comment && (
            <span className='text-red-500'>The comment field is required!</span>
          )}
        </div>
        <input
          type='submit'
          content='Submit Comment'
          className='focus:shadow-outline cursor-pointer rounded bg-sky-700 px-4 py-2 font-bold text-white shadow hover:bg-sky-500 focus:outline-none'
        />
      </form>
    </div>
  );
}

export default Comments;
