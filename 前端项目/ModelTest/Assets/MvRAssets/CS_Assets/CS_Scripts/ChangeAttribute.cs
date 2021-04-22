using UnityEngine;

namespace MvR
{
	/// <summary>
	/// This script changes an enemy's attributes after it loses health.
	/// For example you can make the enemy slow down as it loses health.
	/// </summary>
	public class ChangeAttribute : MonoBehaviour
	{
		// How much health needs to be lost before changing attributes
		public float healthLoss = 20;
		internal float healthLossCount = 0;
		
		// Various attribute multipliers
		public float speedMultiplier = 2;
		public float attackDelayMultiplier = 0.5f;
		public float damageMultiplier = 2;
		
		// How many times to repeat the change
		public int repeat = 0;
		
		// A special animation we can run when an attribute changes
		public AnimationClip specialAnimation;

		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			// If the enemy loses enough health, apply the multipliers.
			if( transform.GetComponent<Enemy>().health > 0 && healthLossCount >= healthLoss && repeat > 0 )
			{
				healthLossCount = 0;

				repeat--;

				// Multiply the enemy's attributes
				transform.GetComponent<Enemy>().speed *= speedMultiplier;
				transform.GetComponent<Enemy>().attackDelay *= attackDelayMultiplier;
				transform.GetComponent<Enemy>().damage *= damageMultiplier;


				// Play a special animation, and assign it as the default walk animation
				if ( specialAnimation )
				{
		    	//animation.Play(specialAnimation.name);
		    
		    	transform.GetComponent<Enemy>().walkAnimation = specialAnimation;
				}
			}
		}
	}
}