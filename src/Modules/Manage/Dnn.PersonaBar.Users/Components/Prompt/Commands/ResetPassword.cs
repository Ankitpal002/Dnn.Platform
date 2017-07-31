﻿using Dnn.PersonaBar.Library.Prompt;
using Dnn.PersonaBar.Library.Prompt.Attributes;
using Dnn.PersonaBar.Library.Prompt.Models;
using DotNetNuke.Entities.Portals;
using DotNetNuke.Entities.Users;

namespace Dnn.PersonaBar.Users.Components.Prompt.Commands
{
    [ConsoleCommand("reset-password", "Prompt_ResetPassword_Description", new[]{
        "id",
        "notify"
    })]
    public class ResetPassword : ConsoleCommandBase
    {
        public override string LocalResourceFile => Constants.LocalResourcesFile;

        [FlagParameter("id", "Prompt_ResetPassword_FlagId", "Integer", true)]
        private const string FlagId = "id";
        [FlagParameter("notify", "Prompt_ResetPassword_FlagNotify", "Boolean", "false")]
        private const string FlagNotify = "notify";


        private bool Notify { get; set; }
        private int? UserId { get; set; }

        public override void Init(string[] args, PortalSettings portalSettings, UserInfo userInfo, int activeTabId)
        {
            base.Init(args, portalSettings, userInfo, activeTabId);
            UserId = GetFlagValue(FlagId, "User Id", -1, true, true, true);
            Notify = GetFlagValue(FlagNotify, "Notify", false);
        }

        public override ConsoleResultModel Run()
        {
            ConsoleErrorResultModel errorResultModel;
            UserInfo userInfo;
            if ((errorResultModel = Utilities.ValidateUser(UserId, PortalSettings, User, out userInfo)) != null) return errorResultModel;
            //Don't allow self password change.
            if (userInfo.UserID == User.UserID)
            {
                return new ConsoleErrorResultModel(LocalizeString("InSufficientPermissions"));
            }
            var success = UsersController.Instance.ForceChangePassword(userInfo, PortalId, Notify);
            return success
                ? new ConsoleResultModel(LocalizeString("Prompt_PasswordReset") + (Notify ? LocalizeString("Prompt_EmailSent") : "")) { Records = 1 }
                : new ConsoleErrorResultModel(LocalizeString("OptionUnavailable"));
        }
    }
}