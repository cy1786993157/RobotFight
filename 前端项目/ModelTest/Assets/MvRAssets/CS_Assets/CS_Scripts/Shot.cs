using UnityEngine;

namespace MvR
{
	/// <summary>
	/// This script contains the attributes of a shot, and handles the behaviour and interaction of each one with its targets. You can set speed, damage, pushback etc
	/// You can also set wether this shot chases the enemy and how fast it rotates. You can also set the shot start and hit effect, as well as a sticky which attaches
	/// itself to the target when hit.
	/// </summary>
	public class Shot : MonoBehaviour
	{
		// Basic attributes
		public float speed = 10;
		public float damage = 5;
		public float pushBack = -1;

		// Remove the shot after a few seconds
		public float removeAfter = 3;

		// The (muzzle) effect created at the start of this shot's life
		public Transform effect;

		// A homing shot chases the nearest enemy, rotating at a set speed
		public bool homing = false;
		public float rotateSpeed = 10;
		public Transform homingTarget;
		
		// Values for internal use
		private Quaternion lookRotation;
		private Vector3 direction;
		
		// Look directly at the enemy when created
		public bool lookAtEnemy = false;
		
		// The sticky object created when this shot hits an enemy
		public Transform sticky;
		public Transform hitEffect;
		
		// A list of valid targets for the shot
		public LayerMask validTargets;
		
		// Should this shot die on collision with the target?
		public bool dieOnHit = true;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// Remove the object after a few seconds
			if( removeAfter > 0 )
				Destroy(gameObject, removeAfter);
	
			// Create a shot (muzzle) effect
			if( effect != null )
				Instantiate(effect, transform.position, transform.rotation);
	
			// If this is a homing shot, make it look for the nearest target, and then rotate towards it
			if( homing )
			{
				if( homingTarget != null )
				{
					// Look directly at the enemy
					if( lookAtEnemy == true )
						transform.LookAt(homingTarget);

					LineRenderer lr = GetComponent<LineRenderer>();

					// If this shot has a line renderer, stretch it to the target. It's an instant hit.
					if( lr )
					{
						// Stretch the line between this transform and the target
						lr.SetPosition(1, new Vector3(0, 0, Vector3.Distance(transform.position, homingTarget.position)));

						Enemy enem = homingTarget.GetComponent<Enemy>();
						ChangeAttribute chgAttrib = homingTarget.GetComponent<ChangeAttribute>();

						// Remove from the target enemy's health
						if( enem )
							enem.health -= (int)damage;

						// If the target has a ChangeAttribute script, remove from its health counter too
						if( chgAttrib )
							chgAttrib.healthLossCount += damage;
				
						// If there is a hit effect, create it at the hit position
						if( hitEffect )
						{
							Transform newShot = Instantiate(hitEffect, homingTarget.position, Quaternion.identity) as Transform;
							Shot actualShot = newShot.GetComponent<Shot>();

							if( actualShot )
								actualShot.validTargets = validTargets;
						}

						// Destroy this script
						Destroy(this);
					}
				}
			}
		}
	
		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			// Move the object forward based on speed
			transform.Translate(Vector3.forward * speed * Time.deltaTime);
	
			// If this is a homing shot, make it look for the nearest target, and then rotate towards it
			if( homing )
			{
				if( homingTarget )
				{
					// Find the direction we need to look in towards the target
					direction = (homingTarget.position - transform.position).normalized;
			 
					// Set the rotation towards the target
					lookRotation = Quaternion.LookRotation(direction);
			 
					// Rotate towrads the target beased on rotateSpeed
					transform.rotation = Quaternion.Slerp(transform.rotation, lookRotation, Time.deltaTime * rotateSpeed);
				}
			}
		}

		/// <summary>
		/// OnTriggerStay is called once per frame for every Collider other that is touching the trigger.
		/// This message is sent to the trigger and the collider that touches the trigger. Note that trigger events are only sent if one of the colliders also has a rigid body attached.
		/// </summary>
		/// <param name='target'>
		/// The triggered collider.
		/// </param>
		public void OnTriggerStay(Collider target)
		{
			// If this shot hits a valid target from the validTargets layer mask, do damage and effects
			// CHECK BIT SHIFT FOR ERROrS
			if( (validTargets.value & 1 << target.GetComponent<Collider>().gameObject.layer) > 0 )
			{
				// Reduce from the target enemy's health
				if( target.GetComponent<Enemy>() != null )
					target.GetComponent<Enemy>().health -= (int)damage;
				else if( target.GetComponent<Building>() != null )
					target.GetComponent<Building>().health -= (int)damage;
	    	
				// Change color of hit object
				//target.renderer.material.color = Color(0,0,0);
	    	
				target.GetComponent<Renderer>().material.SetColor("_MainColor", Color.red);
	    	
				//print(target.renderer.material.color);
	    	
				ChangeAttribute ca = target.GetComponent<ChangeAttribute>();

				if( ca )
					ca.healthLossCount += damage;
	    	
				target.transform.Translate(Vector3.forward * pushBack * Time.deltaTime, Space.World);
	    	
				if( hitEffect )
				{
					Instantiate(hitEffect, transform.position, Quaternion.identity);
				}
	    	
				// If the shot has a sticky object assigned, create it and attach it to the enemy. Make sure the enemy doesn't already have a sticky attached
				if( sticky != null && target.gameObject.GetComponent<Enemy>().sticky == null )
				{
					// Create a new sticky object
					Transform newSticky = (Transform)Instantiate(sticky, target.transform.position, Quaternion.identity);
	    		
					// Set the enemy as its stuck target
					newSticky.GetComponent<Sticky>().stuckTo = target.transform;
	
					// Set this sticky to the target enemy
					target.gameObject.GetComponent<Enemy>().sticky = newSticky;
	    		
					// Put it in the enemy
					newSticky.transform.parent = target.transform;
				}
	    	
				if( dieOnHit == true )
					Destroy(gameObject); // Remove this shot from the game
			}
		}
	}
}
