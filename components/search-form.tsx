'use client';

import { Search } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { SidebarInput } from '@/components/ui/sidebar';
import { ComponentProps, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { GET_METHOD } from '@/lib/req';

export function SearchForm({ ...props }: ComponentProps<'form'>) {
  const [value, setValue] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(false);
    if (!value || value.length <= 0) return;
    GET_METHOD(`/api/search?keyword=${value}`)
      .then(rs => {
        if (rs.order.length || rs.customer.length) setShow(true);
      });
  }, [value]);

  return (
    <form {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput onChange={(e) => setValue(e.target.value)} id="search" placeholder="Type to search..."
                      className="h-8 pl-7" />
        <Search
          className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        {
          show && (
            <div className="absolute w-full top-10 left-0 size-4 -translate-y-1/2 max-h-[calc(100vh-120em)]">
              <Card className={'p-3 overflow-y-auto'}>

              </Card>
            </div>
          )
        }
      </div>
    </form>
  );
}
