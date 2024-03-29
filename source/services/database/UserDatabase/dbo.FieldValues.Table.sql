CREATE TABLE [dbo].[FieldValues](
    [ID] [bigint] IDENTITY(1, 1) NOT NULL,
	[FieldName] [nvarchar](64) NOT NULL,
	[ItemID] [uniqueidentifier] NOT NULL REFERENCES [dbo].[Items] ([ID]) ON DELETE CASCADE ON UPDATE CASCADE,
	[Value] [nvarchar](max) NULL,

    CONSTRAINT [PK_FieldValueID] PRIMARY KEY ([ID]),
    CONSTRAINT [UNIQUE_FieldValue] UNIQUE ([FieldName], [ItemID])
)
