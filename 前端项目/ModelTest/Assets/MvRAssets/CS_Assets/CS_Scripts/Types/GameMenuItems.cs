using UnityEngine;
using System;

namespace MvR.Types
{
	[Serializable]
	public class GameMenuItems
	{
		public string caption = "Menu";
		public Transform reciever;
		public string action = string.Empty;
		public string parameter = string.Empty;
	}
}