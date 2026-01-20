"use client";

import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as motion from 'motion/react-client';
import { MorphingPopover, MorphingPopoverContent, MorphingPopoverTrigger } from '../../components/motion-primitives/morphing-popover';
import { Switch } from './ui/switch';
import { BiLogoMeta } from 'react-icons/bi';
import { DiGoogleDrive } from 'react-icons/di';
import { RiNotionFill } from 'react-icons/ri';
import { AiOutlineOpenAI } from 'react-icons/ai';

export function PopoverCRM() {
  const [integrations, setIntegrations] = useState({
    googleDrive: true,
    meta: false,
    dropbox: false,
    oneDrive: false,
  });

  function toggleIntegration(key: keyof typeof integrations, value?: boolean) {
    setIntegrations((prev) => ({
      ...prev,
      [key]: typeof value === "boolean" ? value : !prev[key],
    }));
  }

  const connectedCount = Object.values(integrations).filter(Boolean).length;

  return (
    <MorphingPopover>
      <MorphingPopoverTrigger asChild>
        <Button variant='outline'>
          <motion.span
            layoutId='morphing-popover-basic-label'
            layout='position'
          >
            External
          </motion.span>
        </Button>
      </MorphingPopoverTrigger>

      {/* Open below the trigger */}
      <MorphingPopoverContent
        side="bottom"
        align="center"
        sideOffset={8}
        className='w-115 p-4 shadow-sm'
      >
          <div className='grid gap-4'>
          <div className='space-y-2'>
            <motion.h4
              layoutId='morphing-popover-basic-label'
              layout='position'
              className='leading-none font-medium'
            >
              Dimensions
            </motion.h4>
            <p className='text-muted-foreground text-sm'>
              Set the dimensions for the layer.
            </p>
          </div>
          <div className='grid gap-2'>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='width'>Width</Label>
              <Input
                id='width'
                defaultValue='100%'
                className='col-span-2 h-8'
                autoFocus
              />
            </div>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='maxWidth'>Max. width</Label>
              <Input
                id='maxWidth'
                defaultValue='300px'
                className='col-span-2 h-8'
              />
            </div>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='height'>Height</Label>
              <Input
                id='height'
                defaultValue='25px'
                className='col-span-2 h-8'
              />
            </div>
            <div className='grid grid-cols-3 items-center gap-4'>
              <Label htmlFor='maxHeight'>Max. height</Label>
              <Input
                id='maxHeight'
                defaultValue='none'
                className='col-span-2 h-8'
              />
            </div>
          </div>
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}