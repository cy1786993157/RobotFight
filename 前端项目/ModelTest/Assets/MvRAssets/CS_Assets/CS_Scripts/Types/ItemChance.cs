using UnityEngine;
using System;

namespace MvR.Types
{
/// <summary>
/// Represents an item and it's drop chance.
/// </summary>
	[Serializable]
	public class ItemChance
	{
		public Transform itemToDrop;
		public float dropChance = 0.1f;
	}
}