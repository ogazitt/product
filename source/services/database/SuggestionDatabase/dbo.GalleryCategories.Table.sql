CREATE TABLE [dbo].[GalleryCategories](
	[CategoryID] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY CLUSTERED,
	[Name] [nvarchar](256) NOT NULL,
	[ParentID] [int] NULL REFERENCES [dbo].[GalleryCategories] ([CategoryID]) ON DELETE NO ACTION ON UPDATE NO ACTION, /* self-join makes cascading hard (DAC barfs on it) */
    [InGallery] BIT NOT NULL DEFAULT(0),
)
