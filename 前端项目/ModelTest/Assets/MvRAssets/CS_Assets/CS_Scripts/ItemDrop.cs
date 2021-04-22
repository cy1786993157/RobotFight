using UnityEngine;
using System.Collections;

namespace MvR
{
	public class ItemDrop : MonoBehaviour
	{
		public Transform itemToDrop;
		
		public float dropChance = 0.1f;
		
		public void DropItem()
		{
			if ( Random.value <= dropChance )
			{ 
				Instantiate(itemToDrop, transform.position, Quaternion.identity);
			}
		}
	}
}
