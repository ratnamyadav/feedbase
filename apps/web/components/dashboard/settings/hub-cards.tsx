'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@radix-ui/react-label';
import { cn } from '@ui/lib/utils';
import { toast } from 'sonner';
import { Button } from 'ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from 'ui/components/ui/card';
import { Input } from 'ui/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui/components/ui/select';
import { ProjectConfigWithoutSecretProps, ProjectProps } from '@/lib/types';
import FileDrop from '@/components/shared/file-drop';

export default function HubConfigCards({
  projectData,
  projectConfigData,
}: {
  projectData: ProjectProps['Row'];
  projectConfigData: ProjectConfigWithoutSecretProps;
}) {
  const [project, setProject] = useState<ProjectProps['Row']>(projectData);
  const [projectConfig, setProjectConfig] = useState<ProjectConfigWithoutSecretProps>(projectConfigData);
  const [OGImage, setOGImage] = useState<string | null>(projectData.og_image || null);
  const router = useRouter();

  async function handleSaveProject() {
    const promise = new Promise((resolve, reject) => {
      fetch(`/api/v1/projects/${projectData.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        // Pass only the changed values
        body: JSON.stringify({
          icon: project.icon !== projectData.icon ? project.icon : undefined,
          icon_radius: project.icon_radius !== projectData.icon_radius ? project.icon_radius : undefined,
          og_image: OGImage !== projectData.og_image ? OGImage : undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err.message);
        });
    });

    toast.promise(promise, {
      loading: 'Updating project...',
      success: 'Project updated successfully.',
      error: (err) => {
        return err;
      },
    });

    promise.then(() => {
      router.refresh();
    });
  }

  // handle save project config
  async function handleSaveProjectConfig() {
    const promise = new Promise((resolve, reject) => {
      fetch(`/api/v1/projects/${projectData.slug}/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        // Pass only the changed values
        body: JSON.stringify({
          changelog_twitter_handle:
            projectConfig.changelog_twitter_handle !== projectConfigData.changelog_twitter_handle
              ? projectConfig.changelog_twitter_handle
              : undefined,
          changelog_preview_style:
            projectConfig.changelog_preview_style !== projectConfigData.changelog_preview_style
              ? projectConfig.changelog_preview_style
              : undefined,
          feedback_allow_anon_upvoting:
            projectConfig.feedback_allow_anon_upvoting !== projectConfigData.feedback_allow_anon_upvoting
              ? projectConfig.feedback_allow_anon_upvoting
              : undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err.message);
        });
    });

    toast.promise(promise, {
      loading: 'Updating project...',
      success: 'Project updated successfully.',
      error: (err) => {
        return err;
      },
    });

    promise.then(() => {
      router.refresh();
    });
  }

  const onChangePicture = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      // setFileError(null);
      const file = e.target.files[0];
      if (file) {
        if (file.size / 1024 / 1024 > 5) {
          // setFileError('File size too big (max 5MB)');
        } else if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
          // setFileError('File type not supported.');
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            setProject((prev) => ({ ...prev, icon: e.target?.result as string }));
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [setProject]
  );

  // Set the project data to the new one (Due to data://urls)
  useEffect(() => {
    setProject((prev) => ({ ...prev, icon: projectData.icon }));
    setOGImage(projectData.og_image || null);
  }, [projectData.icon, projectData.og_image]);

  return (
    <>
      {/* Theme Card */}
      <Card className='flex w-full flex-col '>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Configure your project&apos;s branding.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Name & Slug Config */}
          <div className='flex h-full w-full flex-col space-y-3'>
            {/* Project Logo */}
            <div className='flex h-full w-full flex-col space-y-4'>
              <div className='space-y-1'>
                <Label className='text-foreground/70 text-sm font-light'>Logo</Label>

                {/* File Upload */}
                <div className='group flex h-16 w-16 items-center justify-center transition-all'>
                  <label
                    htmlFor='dropzone-file'
                    className={cn(
                      'bg-background hover:bg-background/90 group-hover:bg-background/90 flex h-full w-full cursor-pointer flex-col items-center justify-center border',
                      project.icon_radius
                    )}>
                    <p className='absolute hidden text-xs text-gray-500 group-hover:block group-hover:transition-all group-hover:duration-300 dark:text-gray-400'>
                      Upload
                    </p>
                    {/* <Image src='/favicon.ico' alt='Logo' width={40} height={40} className='h-full w-full rounded-md object-cover group-hover:opacity-0' /> */}
                    {/* TODO: Find a way to disable caching for next/image and use that */}
                    {project.icon ? (
                      <img
                        src={project.icon}
                        alt='Preview'
                        width={40}
                        height={40}
                        className={cn(
                          'h-full w-full object-cover group-hover:opacity-0',
                          project.icon_radius
                        )}
                      />
                    ) : (
                      <p className='absolute text-xs text-gray-500 group-hover:hidden dark:text-gray-400'>
                        Upload
                      </p>
                    )}
                    <input id='dropzone-file' type='file' className='hidden' onChange={onChangePicture} />
                  </label>
                </div>

                <Label className='text-foreground/50 text-xs font-extralight'>
                  Recommended size is 256x256.
                </Label>
              </div>
            </div>

            <div className='space-y-1'>
              <Label className='text-foreground/70 text-sm font-light'>Logo Radius</Label>
              <div className='flex h-10 w-full flex-row space-x-2'>
                <Select
                  defaultValue={project.icon_radius || 'rounded-md'}
                  onValueChange={(value) => {
                    setProject((prev) => ({ ...prev, icon_radius: value }));
                  }}>
                  <SelectTrigger className='w-[160px] text-sm font-extralight'>
                    <SelectValue placeholder='Select a radius' />
                  </SelectTrigger>
                  <SelectContent className='font-light'>
                    <SelectItem value='rounded-md'>Rounded</SelectItem>
                    <SelectItem value='rounded-none'>Square</SelectItem>
                    <SelectItem value='rounded-full'>Circle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Label className='text-foreground/50 text-xs font-extralight'>
                This is the radius of your logo.
              </Label>
            </div>

            {/* OG Image */}
            <div className='max-w-xs space-y-1'>
              <FileDrop
                labelComponent={<Label className='text-foreground/70 text-sm font-light'>OG Image</Label>}
                image={OGImage}
                setImage={setOGImage}
              />

              <Label className='text-foreground/50 text-xs font-extralight'>
                The OG Image used when sharing your project.
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className='w-32'
            disabled={
              (project.icon === projectData.icon || (!project.icon && !projectData.icon)) &&
              project.icon_radius === projectData.icon_radius &&
              (OGImage === projectData.og_image || (!OGImage && !projectData.og_image))
            }
            onClick={handleSaveProject}>
            Save changes
          </Button>
        </CardFooter>
      </Card>

      {/* Changelog */}
      <Card className='flex w-full flex-col '>
        <CardHeader>
          <CardTitle>Changelog</CardTitle>
          <CardDescription>Configure your project&apos;s changelog.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col space-y-4'>
          {/* Name & Slug Config */}
          <div className='flex h-full w-full flex-col space-y-3'>
            <div className='space-y-1'>
              <Label className='text-foreground/70 text-sm font-light'>Twitter</Label>
              <div className='bg-background focus-within:ring-ring ring-offset-root flex h-9 w-full max-w-xs rounded-md border text-sm font-extralight transition-shadow duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-1'>
                <div className='text-foreground/50 bg-accent flex select-none items-center justify-center rounded-l-md border-r px-3'>
                  @
                </div>
                <Input
                  className='h-full w-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0'
                  placeholder='username'
                  value={projectConfig.changelog_twitter_handle || ''}
                  onChange={(e) => {
                    setProjectConfig((prev) => ({ ...prev, changelog_twitter_handle: e.target.value }));
                  }}
                />
              </div>
              <Label className='text-foreground/50 text-xs font-extralight'>
                Twitter handle linked in your changelog. (Blank to disable)
              </Label>
            </div>
          </div>

          {/* Preview Style */}
          <div className='space-y-1'>
            <Label className='text-foreground/70 text-sm font-light'>Preview Style</Label>
            <div className='flex h-10 w-full flex-row space-x-2'>
              <Select
                defaultValue={projectConfig.changelog_preview_style || 'rounded-md'}
                onValueChange={(value) => {
                  // Set the value
                  setProjectConfig((prev) => ({ ...prev, changelog_preview_style: value }));
                }}>
                <SelectTrigger className='max-w-xs text-sm font-extralight'>
                  <SelectValue placeholder='Select a style' />
                </SelectTrigger>
                <SelectContent className='font-light'>
                  <SelectItem value='summary'>Summary</SelectItem>
                  <SelectItem value='content'>Content</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Label className='text-foreground/50 text-xs font-extralight'>
              Whether to show summary or content as preview.
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className='w-32'
            disabled={
              // If the values are the same as the ones in the database or if they are empty
              projectConfig.changelog_preview_style === projectConfigData.changelog_preview_style &&
              projectConfig.changelog_twitter_handle === projectConfigData.changelog_twitter_handle
            }
            onClick={handleSaveProjectConfig}>
            Save changes
          </Button>
        </CardFooter>
      </Card>

      {/* Feedback */}
      <Card className='flex w-full flex-col '>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <CardDescription>Configure your project&apos;s feedback.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col space-y-4'>
          {/* Anonymous Feedback */}
          <div className='space-y-1'>
            <Label className='text-foreground/70 text-sm font-light'>Anonymous Feedback Upvoting</Label>
            <div className='flex h-10 w-full flex-row space-x-2'>
              <Select
                defaultValue={projectConfig.feedback_allow_anon_upvoting ? 'true' : 'false'}
                onValueChange={(value) => {
                  // Set the value
                  setProjectConfig((prev) => ({ ...prev, feedback_allow_anon_upvoting: value === 'true' }));
                }}>
                <SelectTrigger className='max-w-xs text-sm font-extralight'>
                  <SelectValue placeholder='Select a style' />
                </SelectTrigger>
                <SelectContent className='font-light'>
                  <SelectItem value='true'>Enabled</SelectItem>
                  <SelectItem value='false'>Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Label className='text-foreground/50 text-xs font-extralight'>
              Whether to allow anonymous feedback upvoting.
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className='w-32'
            disabled={
              // If the values are the same as the ones in the database or if they are empty
              projectConfig.feedback_allow_anon_upvoting === projectConfigData.feedback_allow_anon_upvoting
            }
            onClick={handleSaveProjectConfig}>
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
