CREATE TABLE [dbo].[GalleryActivities](
	[Name] [nvarchar](256) NOT NULL PRIMARY KEY CLUSTERED,
	[Definition] [nvarchar](max) NOT NULL, 
    [CategoryID] INT NOT NULL REFERENCES [dbo].[GalleryCategories] ([CategoryID]) ON DELETE CASCADE ON UPDATE CASCADE,
)
