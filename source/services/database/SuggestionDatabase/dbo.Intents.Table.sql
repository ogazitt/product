CREATE TABLE [dbo].[Intents](
    [IntentID] [bigint] IDENTITY(1, 1) NOT NULL,
    [Verb] [nvarchar](64) NOT NULL,
    [Noun] [nvarchar](64) NOT NULL,
    [WorkflowType] [nvarchar](256) NOT NULL,
    CONSTRAINT [PK_IntentID] PRIMARY KEY ([IntentID]),
)

