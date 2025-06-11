import React from 'react'
import Form from 'next/form'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SearchIcon } from 'lucide-react'
import { Button } from '../ui/button'


const Search = () => {
  return (
    <div>
        <Form
        action='/search'
        className='w-full sm:w-auto sm:flex-1 sm:mx-4 mt-2 sm:mt-0 flex items-center space-x-2'
        >
            <Label htmlFor='search' />
            <Input type='text' name='query' placeholder='Search...' />
            <Button variant='outline' size='icon' type='submit'>
            <SearchIcon className='rotate-90 h-8 w-8' />
            </Button>
        </Form>
    </div>
  )
}

export default Search