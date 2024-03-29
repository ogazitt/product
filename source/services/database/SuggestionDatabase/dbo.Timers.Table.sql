CREATE TABLE [dbo].[Timers](
	[ID] [uniqueidentifier] NOT NULL PRIMARY KEY CLUSTERED DEFAULT (newid()),
	[WorkflowType] [nvarchar](256) NOT NULL,
	[NextRun] [datetime2] NOT NULL,
	[Cadence] [int] NULL,
	[Created] [datetime2] NOT NULL,
	[LastModified] [datetime2] NOT NULL,
	[LockedBy] [nvarchar](64) NULL,
)
