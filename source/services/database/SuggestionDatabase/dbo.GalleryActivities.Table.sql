CREATE TABLE [dbo].[GalleryActivities](
	[ActivityID] [int] NOT NULL PRIMARY KEY CLUSTERED,
	[Name] [nvarchar](256) NOT NULL,
	[Definition] [nvarchar](max) NOT NULL, 
    [CategoryID] INT NOT NULL REFERENCES [dbo].[GalleryCategories] ([CategoryID]) ON DELETE CASCADE ON UPDATE CASCADE, 
    [InGallery] BIT NOT NULL DEFAULT(0),
    [Filter] NCHAR(256) NULL, 
)
