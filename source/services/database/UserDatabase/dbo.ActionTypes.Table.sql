CREATE TABLE [dbo].[ActionTypes](
	[ActionTypeID] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY CLUSTERED,
	[ActionName] [nvarchar](64) NOT NULL,
	[DisplayName] [nvarchar](64) NOT NULL,
	[FieldName] [nvarchar](64) NOT NULL,
	[SortOrder] [int] NOT NULL,
)

