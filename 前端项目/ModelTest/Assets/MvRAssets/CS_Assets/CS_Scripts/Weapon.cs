using UnityEngine;
using System.Collections;

namespace MvR
{
	/// <summary>
	/// This script handles shooting from a unit. When attached to a unit it creates a projectile every few seconds when it detects a valid target.
	/// You can set how many seconds to wait before shooting a burst, how many shots to shoot, and how long to wait between each shot in a burst.
	/// You can also set the muzzles from which a projectile is shot, and the range from which an enemy can be detected, as well as a layermask for valid targets.
	/// </summary>
	public class Weapon : MonoBehaviour
	{
		// How long to wait before shooting a burst of projectiles
		public float burstDelay = 3;
		private float burstDelayCount = 0;
		
		// How many shots in a burst
		public int shotsPerBurst = 1;
		private int shotsPerBurstCount = 0;
		
		// How many seconds to wait between each shot in a burst
		public float shotDelay = 0.5f;
		private float shotDelayCount = 0.5f;
		
		// The projectile which will be shot
		public Transform shot = null;
		
		// The muzzles from which a projectile is shot. If no muzzle is set, the projectile will be created at the position of the transform
		public Transform[] muzzle;
		
		// The range from which a target can be detected
		public float range = 8;
		
		// How many extra range lanes to create sideways
		public int lanesRange = 1;
		
		// The gap between the extra range lanes
		public float lanesGap = 1;
		
		// The offset of the entire weapon range scheme
		public Vector2 lanesOffset = new Vector2(0, 0);
		
		// A general index for use in for functions
		private int index;
		private int indexB;
		
		// Holds the current target which is in range
		private Transform targetInRange;
		
		// If this is set to true, the weapon will shoot once and Destroy this gameObject
		public bool oneShot = false;
		
		// A list of valid targets for the weapon
		public LayerMask validTargets;

		// The name of the animation to be played when this weapon attacks
		public AnimationClip attackAnimation;

		// How many seconds to wait before producing the shot from this weapon
		public float attackAnimationTime = 0;

		// Is the weapon shooting right now?
#pragma warning disable 0414
		private bool isShooting = false;
#pragma warning restore 0414

		private Vector3 direction;
		private Vector3 position;

		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			if( burstDelayCount < burstDelay )
			{
				// Count up towards the next burst
				burstDelayCount += Time.deltaTime;
			}
			else
			{
				if( range <= 0 )
				{
					// If the target's range is 0, set this transform as the targetInRange, which will make it shoot without waiting to detect a target first
					targetInRange = this.transform;
				}
				else
				{
					RaycastHit hit;
			
					// If the weapon has muzzles, go through all of them and check for valid targets
					if( muzzle.Length > 0 )
					{
						foreach( Transform muzzleIndex in muzzle )
						{
							if( muzzleIndex )
							{
								for( index = 0; index < lanesRange; index++ )
								{
									if( this.transform.localScale.y > 0 )
										direction = transform.TransformDirection(muzzleIndex.forward) * range;
									else
										direction = transform.TransformDirection(muzzleIndex.forward) * -range;

									position = muzzleIndex.right * lanesGap * index;
				        	
									if( Physics.Raycast(muzzleIndex.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction, out hit, range, validTargets) || Physics.Raycast(muzzleIndex.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) - position, direction, out hit, range, validTargets) )
									{
										// Set the object we detected as the target in range
										targetInRange = hit.collider.transform;
									}
								}
							}
						}
					}
					else
					{
						// If there are no muzzles, check for targets straight from the center of this transform
						for( index = 0; index < lanesRange; index++ )
						{
							if( Physics.Raycast(transform.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + new Vector3(index * lanesGap, 0.1f, 0), transform.forward, out hit, range, validTargets) || Physics.Raycast(transform.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + new Vector3(index * -lanesGap, 0.1f, 0), transform.forward, out hit, range, validTargets) )
							{
								// Set the object we detected as the target in range
								targetInRange = hit.collider.transform;
							}
						}
					}
				}
		
				// If there is a target in range, SHOOT!
				if( targetInRange )// && isShooting == false )
				{
					// Count up towards the next shot in a burst
					if( shotDelayCount < shotDelay )
					{
						shotDelayCount += Time.deltaTime;
					}
					else
					{
						shotsPerBurstCount++;

						shotDelayCount = 0;
				
						Shoot(attackAnimationTime);

						// Play the attack animation, if available
						if ( this.GetComponent<Animation>() )
						{
							if ( attackAnimation )
							{
                                if (this.GetComponent<Animation>()[attackAnimation.name])
                                    this.GetComponent<Animation>().Play(attackAnimation.name);
							}
							else
							{
                                if (this.GetComponent<Animation>()["attack"])
                                    this.GetComponent<Animation>().Play("attack");
							}
						}
					}
			
					// Reset burst, shot, and target values
					if( shotsPerBurstCount >= shotsPerBurst )
					{
						shotsPerBurstCount = 0;
						burstDelayCount = 0;
						targetInRange = null;
					}
				}
				else
				{
					// Reset burst and shot count values
					burstDelayCount = 0;
					shotsPerBurstCount = 0;
					shotDelayCount = 0;
				}
			}
		}

		/// <summary>
		/// Draw gizmo lines corresponding to the full range scheme of the weapon
		/// </summary>
		public void OnDrawGizmos()
		{
			Gizmos.color = Color.red;
    
			if( muzzle.Length > 0 )
			{
				foreach( Transform muzzleIndex in muzzle )
				{
					if( muzzleIndex )
					{
						for( index = 0; index < lanesRange; index++ )
						{
							if( transform.localScale.y > 0 )
								direction = transform.TransformDirection(muzzleIndex.forward) * range;
							else
								direction = transform.TransformDirection(muzzleIndex.forward) * -range;
			        
							position = muzzleIndex.right * lanesGap * index;
		        	
							Gizmos.DrawRay(muzzleIndex.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
		        	
							position = muzzleIndex.right * -lanesGap * index;
		        	
							Gizmos.DrawRay(muzzleIndex.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
						}
					}
				}
			}
			else
			{
				for( index = 0; index < lanesRange; index++ )
				{
					if( transform.localScale.y > 0 )
						direction = transform.TransformDirection(transform.forward) * range;
					else
						direction = transform.TransformDirection(transform.forward) * -range;
			        
					position = transform.right * lanesGap * index;
	    	
					Gizmos.DrawRay(transform.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
	    	
					position = transform.right * -lanesGap * index;
	    	
					Gizmos.DrawRay(transform.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
				}
			}   
		}

		/// <summary>
		/// Shoots with a delay delay.
		/// </summary>
		/// <param name='delay'>
		/// Delay.
		/// </param>
		internal void Shoot( float delay )
		{
			Transform newShot = null;
			isShooting = true;

			if ( shot )
			{
				// If the weapon has muzzles, go through all of them and create a shot in each
				if ( muzzle.Length > 0 )
				{
					foreach (Transform index in muzzle )
					{
						if ( index )
						{
							// Create a new shot object
							newShot = Instantiate( shot, index.position, index.rotation) as Transform;
							Shot actualShot = newShot.GetComponent<Shot>();

							// If the shot has a Shot script, set its valid target and target in range from this script
							if ( actualShot )
							{
								actualShot.validTargets = validTargets;

								if ( actualShot.homing )
								{
									if ( targetInRange )
									{
										actualShot.homingTarget = targetInRange;
									}
								}
							}
						}
					}
				}
				else // If there are no muzzles, create shots in the center of this transform
				{
					// Create a new shot object
					newShot = Instantiate( shot, transform.position, transform.rotation) as Transform;
					Shot actualShot = newShot.GetComponent<Shot>();

					// If the shot has a Shot script, set its valid target and target in range from this script
					if ( actualShot )
					{
						actualShot.validTargets = validTargets;

						if ( actualShot.homing )
						{
							if ( targetInRange )
							{
								actualShot.homingTarget = targetInRange;
							}
						}
					}
				}
			}

			newShot.gameObject.SetActive(false);

			StartCoroutine(DelayForSeconds(newShot,delay));

			isShooting = false;
		}

		/// <summary>
		/// Executes WaitForSconds(delay);
		/// </summary>
		/// <returns>The for seconds.</returns>
		/// <param name="delay">Delay.</param>
		private IEnumerator DelayForSeconds(Transform shot, float delay)
		{
			yield return new WaitForSeconds(delay);

			shot.gameObject.SetActive(true);

			// If oneShot is true, Destroy this gameObject
			if ( oneShot )
				Destroy(gameObject);
		}
	}
}


