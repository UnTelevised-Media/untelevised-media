import React from 'react';
import Form from 'next/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { SearchIcon } from 'lucide-react';
import { Button } from '../ui/button';

const Search = () => {
  return (
    <div>
      <Form
        action='/search'
        className='mt-2 flex w-full items-center space-x-2 sm:mx-4 sm:mt-0 sm:w-auto sm:flex-1'
      >
        <Label htmlFor='search' className='sr-only'>
          Search
        </Label>
        <Input id='search' type='text' name='query' placeholder='Search...' />
        <Button variant='outline' size='icon' type='submit' aria-label='Submit search'>
          <SearchIcon className='h-8 w-8 rotate-90' aria-hidden='true' />
        </Button>
      </Form>
    </div>
  );
};

export default Search;
