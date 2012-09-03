using System;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost.Helpers;
using BuiltSteady.Product.ServiceUtilities.FBGraph;
using BuiltSteady.Product.Shared.Entities;
using BuiltSteady.Product.ServiceHost.Nlp;

namespace BuiltSteady.Product.ServiceHost
{
    public class StepProcessor : ItemProcessor
    {
        public StepProcessor(User user, UserStorageContext storage)
        {
            this.user = user;
            this.storage = storage;
        }

        public override bool ProcessCreate(Item item)
        {
            // ProcessCreate extracts intent by calling the ExtractIntent override
            if (base.ProcessCreate(item))
                return true;

            // if an intent was found, copy it to the ActionType fieldvalue
            var fv = item.GetFieldValue(ExtendedFieldNames.Intent);
            if (fv != null && fv.Value != null)
                item.GetFieldValue(FieldNames.ActionType, true).Value = fv.Value;
            return true;
        }

        public override bool ProcessDelete(Item item)
        {
            if (base.ProcessDelete(item))
                return true;
            return false;
        }

        public override bool ProcessUpdate(Item oldItem, Item newItem)
        {
            // base handles ItemType changing
            if (base.ProcessUpdate(oldItem, newItem))
                return true;

            if (newItem.Name != oldItem.Name)
            {   // name changed, process like new item
                ProcessCreate(newItem);
                return true;
            }
            return false;
        }

        protected override string ExtractIntent(Item item)
        {
            string actionType = null;
            bool findArticle = false;
            string name = item.Name.ToLower().Trim();

            // auto-assign intent based on keywords in the name
            if (name.Contains("recommendation") || name.Contains("facebook") || name.Contains("ask") && name.Contains("friends"))
            {
                actionType = ActionTypes.AskFriends;
                name = name.Replace("recommendation", "").Replace("facebook", "").Replace("friends", "");
                findArticle = true;
            }

            if (name.StartsWith("call"))
                actionType = ActionTypes.Call;
            if (name.StartsWith("schedule") || name.Contains("appointment") && name.Contains("calendar"))
                actionType = ActionTypes.Schedule;
            if (name.StartsWith("text"))
                actionType = ActionTypes.TextMessage;
            if (name.StartsWith("email"))
                actionType = ActionTypes.SendEmail;
            if (name.StartsWith("find"))
            {
                actionType = ActionTypes.Find;
                findArticle = true;
            }

            if (actionType != null)
            {
                if (findArticle)
                {
                    // store the article as an extended fieldvalue 
                    try
                    {
                        // use the NLP engine to extract the article
                        Phrase phrase = new Phrase(name);
                        if (phrase.Task != null)
                        {
                            string verb = phrase.Task.Verb.ToLower().Trim();
                            string article = phrase.Task.Article.ToLower().Trim();
                            //var words = item.Name.Split(new char[] { ' ', '\n', '.', ',', ';', ':', '"', '\\' }, StringSplitOptions.RemoveEmptyEntries);
                            //article = words[words.Length - 1];

                            // store the article
                            item.GetFieldValue(ExtendedFieldNames.Article, true).Value = article;                            
                        }
                    }
                    catch (Exception ex)
                    {
                        TraceLog.TraceException("Could not initialize NLP engine", ex);
                    }
                }
                return actionType;
            }

            // default to reminder
            return ActionTypes.Reminder;
            //return base.ExtractIntent(item);
        }
    }
}
