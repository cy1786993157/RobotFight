using System.Collections;
using UnityEngine;
using MvR.Types;

namespace MvR
{
	/// <summary>
	/// handles enemy behaviour, moving and attacking valid targets. It also kills the enemy when its health reaches 0.
	/// </summary>
	public class Enemy : MonoBehaviour
	{
		private GameObject gameController;
		
		// Enemy basic attributes
		public float speed = 0.2f;
		public int health = 100;
		private float healthMax;
		
		// Enemy parts that fall off as it loses health
		public Transform[] parts;
		private int partHealth;
		private int partsLeft;
		
		// The range from which a target can be detected
		public float range = 2;
		
		// How many extra range lanes to create sideways
		public int lanesRange = 1;
		
		// The gap between the extra range lanes
		public float lanesGap = 1;
		
		// The offset of the entire weapon range scheme
		public Vector2 lanesOffset = new Vector2(0, 0);
		
		// Delay between attacks
		public float attackDelay = 2;
		private float attackDelayCount = 0;
		
		// Damage per attack
		public float damage = 10;
		
		// Current attack target
		private Transform attackTarget;
		
		// A list of valid targets for the enemy
		public LayerMask validTargets;
		
		// Suicide damage caused when the enemy touches a target
		public int kamikaze = 0;
		
		// Effect created when a unit dies
		public Transform deathEffect;
		
		// The lane this enemy belongs to
		internal Transform lane;
		
		// The sticky that is attached to this enemy
		internal Transform sticky;
		
		// An object which, if reached, will in the game in a Loss
		public Transform defeatLine;
		
		// If this enemy dead?
		private bool dead = false;
		
		// Various sounds for the enemy
		public AudioClip soundAttack;
		public AudioClip soundDie;

		// General use index
		private int index;

		// Animation clips for Walk, Attack, Die
		public AnimationClip walkAnimation;
		public AnimationClip attackAnimation;
		public AnimationClip dieAnimation;

		// How many seconds to wait before issuing the attack ( damage, sound effect, etc )
		public float attackAnimationTime = 0;

		// Is the enemy attacking right now?
		private bool isAttacking = false;

		// A list of droppable items with their drop chance
		public ItemChance[] itemDrops;
		public GUISkin guiSkin;

		// The camera position
		private Vector3 cameraPosition;
		
		// The relative healthbar position
		public Rect healthBarPosition;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// Caching the gamecontroller for later use
			gameController = GameObject.FindGameObjectWithTag("GameController");
	
			healthMax = health;
	
			// Calculate the health for each part of the enemy
			partHealth = health / (parts.Length + 1);
			partsLeft = parts.Length;
		}

		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			if (health > 0)
			{
				// If the enemy has no target, look for the closest one and set it as the current target.
				if (attackTarget == null)
				{
					RaycastHit hit;
			
					// Go through the range scheme and check hits with valid targets
					for (index = 0; index < lanesRange; index++)
					{
						if (Physics.Raycast(transform.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + new Vector3(index * lanesGap, 0.1f, 0), transform.forward, out hit, range, validTargets) || Physics.Raycast(transform.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + new Vector3(index * -lanesGap, 0.1f, 0), transform.forward, out hit, range, validTargets))
						{
							// Set the object we detected as the target in range
							attackTarget = hit.collider.transform;

							return;
						}
					}

                    if (GetComponent<Animation>())
					{
						if (walkAnimation)
						{
                            if (GetComponent<Animation>()[walkAnimation.name])
							{
                                if (!GetComponent<Animation>().isPlaying)
								{
                                    GetComponent<Animation>().Play(walkAnimation.name);
								}
							}
						}
						else
						{
                            if (!GetComponent<Animation>().isPlaying)
							{
                                GetComponent<Animation>().Play("walk");
							}
						}
					}

					// Move forward based on speed
					transform.Translate(Vector3.forward * speed * Time.deltaTime, Space.Self);
				}
		
				// If the enemy's health drops below the part health, remove that part
				if (partsLeft > 0 && health <= partsLeft * partHealth)
				{
					partsLeft--;
			
					// Remove the correct part if it's available
					if (parts [partsLeft])
					{
						// If the part has a Gib script, run it
						if (parts [partsLeft].GetComponent<Gib>())
						{
							parts [partsLeft].GetComponent<Gib>().enabled = true;
							parts [partsLeft].GetComponent<Gib>().lane = lane;
						}
						else // Otherwise, destroy it
						{
							Destroy(parts [partsLeft].gameObject);
						}
				
						parts [partsLeft].transform.parent = null;
					}
				}
		
				// Make the enemy attack its target with a delay
				if (attackDelay > 0 || kamikaze > 0)
				{
					if (isAttacking == false)
					{
						if (attackDelayCount < attackDelay)
						{
							attackDelayCount += Time.deltaTime;
						}
						else if (attackTarget) // If there is a valid target, attack it
						{
							attackDelayCount = 0;
					
							//Attack(attackAnimationTime);
							isAttacking = true;

							Invoke("Attack", attackAnimationTime);

                            if (GetComponent<Animation>())
							{
								if (attackAnimation)
								{
                                    if (GetComponent<Animation>()[attackAnimation.name])
									{
                                        GetComponent<Animation>().Play(attackAnimation.name);
									}
								}
                                else if (GetComponent<Animation>()["attack"])
								{
                                    GetComponent<Animation>().Play("attack");
								}
							}
						}
					}
                    if (!GetComponent<Animation>().isPlaying)
					{
						attackTarget = null;
					}
				}
			}
			else if (dead == false)   // If health is 0 or less, remove the object
			{
				Die();
			}
		}

		/// <summary>
		/// Draw gizmo lines corresponding to the full range scheme of the Enemy.
		/// </summary>
		public void OnDrawGizmos()
		{
			Gizmos.color = Color.red;

			for (index = 0; index < lanesRange; index++)
			{
				Vector3 direction = transform.TransformDirection(transform.forward) * range;
			        
				Vector3 position = transform.right * lanesGap * index;
	    	
				Gizmos.DrawRay(transform.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
	    	
				position = transform.right * -lanesGap * index;
	    	
				Gizmos.DrawRay(transform.position + new Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
			}
		}

		/// <summary>
		/// OnGUI is called for rendering and handling GUI events.
		/// This means that your OnGUI implementation might be called several times per frame (one call per event).
		/// For more information on GUI events see the Event reference. If the MonoBehaviour's enabled property is
		/// set to false, OnGUI() will not be called.
		/// </summary>
		public void OnGUI()
		{
			GUI.skin = guiSkin;
	
			if (guiSkin != null)
			{
				if (Input.GetKey(KeyCode.H))
				{
					// If health is larger than 0, display a health bar on the building
					if (health >= 0)
					{
						cameraPosition = Camera.main.WorldToScreenPoint(transform.position);
				
						cameraPosition.y = Screen.height - (cameraPosition.y - 50);
				
						GUI.Box(new Rect(cameraPosition.x - healthBarPosition.x, cameraPosition.y - healthBarPosition.y, healthBarPosition.width, healthBarPosition.height), health.ToString() + "/" + healthMax.ToString(), "Healthbar Red");
				
						GUI.Box(new Rect(cameraPosition.x - healthBarPosition.x, cameraPosition.y - healthBarPosition.y, (health / healthMax) * healthBarPosition.width, healthBarPosition.height), "", "Healthbar Green");
					}
				}
			}
		}

		/// <summary>
		/// OnTriggerEnter is called when the Collider other enters the trigger.
		/// This message is sent to the trigger collider and the rigidbody (if any) that the trigger collider belongs to,
		/// and to the rigidbody (or the collider if there is no rigidbody) that touches the trigger. Note that trigger
		/// events are only sent if one of the colliders also has a rigidbody attached.
		/// </summary>
		/// <param name='other'>
		/// Other objects collider.
		/// </param>
		public void OnTriggerEnter(Collider other)
		{
			// If this enemy collides with the Defeat Line, it's game over
			if (other.name == defeatLine.name)
			{
				EnemyDispenser ed = gameController.GetComponent<EnemyDispenser>();

				if (ed && ed.lose == false)
					ed.Lose();
			}
		}

		/// <summary>
		/// Attacks the target, reducing damage.
		/// </summary>
		/// <param name='delay'>
		/// Delay.
		/// </param>
		internal void Attack()
		{
			//isAttacking = true;
	
			//StartCoroutine(DelayForSeconds(delay));

			if (kamikaze <= 0)
			{
				if (attackTarget)
				{
					Building building = attackTarget.GetComponent<Building>();

					if (building)
						building.health -= damage;
				}
			}
			else // Else, set its health to 0 and reduce kamikaze damage from the target
			{
				if (attackTarget)
				{
					Building building = attackTarget.GetComponent<Building>();

					if (building)
						building.health -= kamikaze;
				}

				health = 0;
			}

			if (soundAttack)
                GetComponent<AudioSource>().PlayOneShot(soundAttack);

			isAttacking = false;
		}

		/// <summary>
		/// Die condition.
		/// </summary>
		internal void Die()
		{
			dead = true;
    
			// Play a death sound
            if (GetComponent<AudioSource>())
			{
				if (soundDie)
                    GetComponent<AudioSource>().PlayOneShot(soundDie);
			}
			// Disable the collider
            GetComponent<Collider>().enabled = false;

			// Play the death animation, and wait for it to be over
//			if ( animation.GetClip("die") )
//			{
//				animation.Play("die");
//
			//				DelayForSeconds(animation.GetClip("die").length);
//			}

            if (GetComponent<Animation>())
			{
				if (dieAnimation)
				{
                    if (GetComponent<Animation>().GetClip(dieAnimation.name))
					{
                        GetComponent<Animation>().Play(dieAnimation.name);

                        Invoke("RemoveDead", GetComponent<Animation>().GetClip(dieAnimation.name).length);
						//StartCoroutine(DelayForSeconds(animation.GetClip(dieAnimation.name).length));
					}
				}
                else if (GetComponent<Animation>().GetClip("die"))
				{
                    GetComponent<Animation>().Play("die");

                    Invoke("RemoveDead", GetComponent<Animation>().GetClip("die").length);
					//StartCoroutine(DelayForSeconds(animation.GetClip("die").length));
				}
				else
				{
					RemoveDead();
				}
			}

			DropItem();

//			// Destroy this object
//			Destroy(gameObject); // Remove this shot from the game
//	
//			// Create a death effect, if available
//			if( deathEffect != null )
//			{
//				Transform newEffect = Instantiate(deathEffect, transform.position, Quaternion.identity) as Transform;
//				Shot actualShot = newEffect.GetComponent<Shot>();
//
//				if( actualShot )
//					actualShot.validTargets = validTargets;
//			}
//
//			// Add to the number killed enemies
//			gameController.GetComponent<EnemyDispenser>().enemiesKilled++;
		}
		
		/// <summary>
		/// Drops items based on a chance.
		/// </summary>
		internal void DropItem()
		{
			foreach ( var singleItem in itemDrops )
			{
				// If an item is assigned, proceed
				if ( singleItem.itemToDrop )
				{
					// If the drop chance of an item is smaller than a random number between 0 and 1
					if ( Random.value <= singleItem.dropChance )
					{ 
						// Create the item drop
						Instantiate(singleItem.itemToDrop, transform.position, Quaternion.identity);
					}
				}
			}
		}

		internal void RemoveDead()
		{
			// Destroy this object
			Destroy(gameObject); // Remove this shot from the game
			
			// Create a death effect, if available
			if (deathEffect != null)
			{
				Transform newEffect = Instantiate(deathEffect, transform.position, Quaternion.identity) as Transform;
				Shot actualShot = newEffect.GetComponent<Shot>();
				
				if (actualShot)
					actualShot.validTargets = validTargets;
			}
			
			// Add to the number killed enemies
			gameController.GetComponent<EnemyDispenser>().enemiesKilled++;
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