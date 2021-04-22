using UnityEngine;
using System;

namespace MvR.Types
{
	/// <summary>
	/// Represents a menu item even though it's plural.
	/// </summary>
	[Serializable]
	public class MenuItems
	{
		public string caption = "Menu";
		public Transform reciever;
		public string action = string.Empty;
	}
}