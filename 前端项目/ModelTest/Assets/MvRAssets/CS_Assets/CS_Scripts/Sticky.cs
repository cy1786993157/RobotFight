using System.Collections;
using UnityEngine;

namespace MvR
{
	/// <summary>
	/// This script handles an object which gets attached to the target of a shot, when said shot hits the target.
	/// It can cause damage over tiem to the target or even freeze it for a while. After a few seconds the sticky object is removed.
	/// </summary>
	public class Sticky : MonoBehaviour
	{
		// The object that this sticky-object is attached to
		public Transform stuckTo;
		
		// How many seconds to wait before removing this sticky
		public float stickTime = 3;
		
		// Cause damage over time to the target
		public float attackDelay = 1;
		private float attackDelayCount = 0;
		public float damage = 1;
		
		// Freeze this target
		public bool freeze = false;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// If freeze is set to true, stop animating this target, and stop its script if it's an enemy
			if( freeze )
			{
				transform.parent.GetComponent<Animation>().Stop();
		
				if( transform.parent.GetComponent<Enemy>() != null )
					transform.parent.GetComponent<Enemy>().enabled = false;
			}
	
			// Wait for the sticky duration
			DelayForSeconds(stickTime);
	
			// Then unfreeze the target and run its previously frozen script
			if( freeze )
			{
				transform.parent.GetComponent<Animation>().Play();
		
				transform.parent.GetComponent<Enemy>().enabled = true;
			}
	
			// Finally, destroy the sticky object
			Destroy(gameObject);
		}
	
		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			// Count up towards the next attack
			attackDelayCount += Time.deltaTime;
	
			// Attack the target
			if( attackDelayCount >= attackDelay )
			{
				attackDelayCount = 0;
		
				if( stuckTo )
					stuckTo.GetComponent<Enemy>().health -= (int)damage;
			}
		}

		/// <summary>
		/// Executes WaitForSconds(delay);
		/// </summary>
		/// <returns>The for seconds.</returns>
		/// <param name="delay">Delay.</param>
		private IEnumerator DelayForSeconds(float delay)
		{
			yield return new WaitForSeconds(delay);
		}
	}
}
