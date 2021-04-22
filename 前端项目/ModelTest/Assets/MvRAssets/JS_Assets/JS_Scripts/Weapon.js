//This script handles shooting from a unit. When attached to a unit it creates a projectile every few seconds when it detects a valid target.
//You can set how many seconds to wait before shooting a burst, how many shots to shoot, and how long to wait between each shot in a burst.
//You can also set the muzzles from which a projectile is shot, and the range from which an enemy can be detected, as well as a layermask for valid targets.

#pragma strict

//Caching the transform for later use
private var thisTransform:Transform;

//How long to wait  before shooting a burst of projectiles
var burstDelay:float = 3;
private var burstDelayCount:float = 0;

//How many shots in a burst
var shotsPerBurst:int = 1;
private var shotsPerBurstCount:int = 0;

//How many seconds to wait between each shot in a burst
var shotDelay:float = 0.5;
private var shotDelayCount:float = 0.5;

//The projectile which will be shot
var shot:Transform;

//The muzzles from which a projectile is shot. If no muzzle is set, the projectile will be created at the position of the transform
var muzzle:Transform[];

//The range from which a target can be detected
var range:float = 8;

//How many extra range lanes to create sideways
var lanesRange:int = 1;

//The gap between the extra range lanes
var lanesGap:float = 1;

//The offset of the entire weapon range scheme
var lanesOffset:Vector2 = Vector2(0,0);

//A general index for use in for functions
private var index:int;
private var indexB:int;

//Holds the current target which is in range
private var targetInRange:Transform;

//If this is set to true, the weapon will shoot once and Destroy this gameObject
var oneShot:boolean = false;

//A list of valid targets for the weapon
var validTargets:LayerMask;

//The name of the animation to be played when this weapon attacks
var attackAnimation:AnimationClip;

//How many seconds to wait before producing the shot from this weapon
var attackAnimationTime:float = 0;

//Is the weapon shooting right now?
private var isShooting:boolean = false;

//If it's a homing type of weapon, then the range of attack is by distance
function Start()
{
	//cache this transform
	thisTransform = transform;
}

function Update()
{
	if ( burstDelayCount < burstDelay )
	{
		//Count up towards the next burst
		burstDelayCount += Time.deltaTime;
	}
	else
	{
		if ( range <= 0 )    
		{
			//If the target's range is 0, set this transform as the targetInRange, which will make it shoot without waiting to detect a target first
			targetInRange = thisTransform;
		}
		else
		{
			var hit:RaycastHit;
			
			//If the weapon has muzzles, go through all of them and check for valid targets
			if ( muzzle.Length > 0 )
			{
				for ( muzzleIndex in muzzle )
				{
					if ( muzzleIndex )    
					{
						for ( index = 0 ; index < lanesRange ; index++ )
				        {
				        	if ( thisTransform.localScale.y > 0 )    direction = transform.TransformDirection(muzzleIndex.forward) * range;
				        	else    direction = transform.TransformDirection(muzzleIndex.forward) * -range;
			        		
			        		position = muzzleIndex.right * lanesGap * index;
				        	
				        	if ( Physics.Raycast( muzzleIndex.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction, hit, range, validTargets) || Physics.Raycast( muzzleIndex.position + Vector3(lanesOffset.y, 0, lanesOffset.x) - position, direction, hit, range, validTargets) )
				        	{
				        		//Set the object we detected as the target in range
				        		targetInRange = hit.collider.transform;
				        	}
				        }
					}
				}
			}
			else
			{
				//If there are no muzzles, check for targets straight from the center of this transform
				for ( index = 0 ; index < lanesRange ; index++ )
				{
					if ( Physics.Raycast( thisTransform.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + Vector3(index * lanesGap, 0.1, 0), thisTransform.forward, hit, range, validTargets) || Physics.Raycast( thisTransform.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + Vector3(index * -lanesGap, 0.1, 0), thisTransform.forward, hit, range, validTargets) )
		        	{
		        		//Set the object we detected as the target in range
		        		targetInRange = hit.collider.transform;
		        	}
	        	}
			}
		}
		
		//If there is a target in range, SHOOT!
		if ( targetInRange )//&& isShooting == false )
		{
			//Count up towards the next shot in a burst
			if ( shotDelayCount < shotDelay )
			{
				shotDelayCount += Time.deltaTime;
			}
			else
			{
				shotsPerBurstCount++;
				
				shotDelayCount = 0;
				
				Shoot(attackAnimationTime);
				
				//Play the attack animation, if available
				if ( animation )    
				{
					if ( attackAnimation )
					{
						if ( animation[attackAnimation.name] )    animation.Play(attackAnimation.name);
					}
					else
					{
						if ( animation["attack"] )    animation.Play("attack");
					}
				}
			}
			
			//Reset burst, shot, and target values
			if ( shotsPerBurstCount >= shotsPerBurst )
			{
				shotsPerBurstCount = 0;
				burstDelayCount = 0;
				targetInRange = null;
			}
		}
		else
		{
			//Reset burst and shot count values
			burstDelayCount = 0;
            shotsPerBurstCount = 0;
			shotDelayCount = 0;
		}
	}
}

private var direction:Vector3;
private var position:Vector3;

//Draw gizmo lines corresponding to the full range scheme of the weapon
function OnDrawGizmos() 
{
    Gizmos.color = Color.red;
    
    if ( muzzle.Length > 0 )
	{
		for ( muzzleIndex in muzzle )
		{
			if ( muzzleIndex )    
			{
		        for ( index = 0 ; index < lanesRange ; index++ )
		        {
		        	if ( transform.localScale.y > 0 )    direction = transform.TransformDirection(muzzleIndex.forward) * range;
				    else    direction = transform.TransformDirection(muzzleIndex.forward) * -range;
			        
		        	position = muzzleIndex.right * lanesGap * index;
		        	
		        	Gizmos.DrawRay( muzzleIndex.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
		        	
		        	position = muzzleIndex.right * -lanesGap * index;
		        	
		        	Gizmos.DrawRay( muzzleIndex.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
		        }
		    }
		}
	}
	else
	{
		for ( index = 0 ; index < lanesRange ; index++ )
        {
			if ( transform.localScale.y > 0 )    direction = transform.TransformDirection(transform.forward) * range;
			else    direction = transform.TransformDirection(transform.forward) * -range;
			        
	    	position = transform.right * lanesGap * index;
	    	
	    	Gizmos.DrawRay( transform.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
	    	
	    	position = transform.right * -lanesGap * index;
	    	
	    	Gizmos.DrawRay( transform.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
    	}
	}   
}

//This function shoots with a delay
function Shoot( delay:float )
{
	isShooting = true;
	
	if ( shot )    
	{
		//If the weapon has muzzles, go through all of them and create a shot in each
		if ( muzzle.Length > 0 )
		{
			for ( index in muzzle )
			{
				if ( index )    
				{
					var newShot:Transform;
					
					//Create a new shot object
					newShot = Instantiate( shot, index.position, index.rotation);
					
					//If the shot has a Shot script, set its valid target and target in range from this script
					if ( newShot.GetComponent(Shot) )
					{
						newShot.GetComponent(Shot).validTargets = validTargets;
					
						if ( newShot.GetComponent(Shot).homing )
						{
							if ( targetInRange )    
							{
								newShot.GetComponent(Shot).homingTarget = targetInRange;
							}
						}
					}
				}
			}
		}
		else //If there are no muzzles, create shots in the center of this transform
		{
			//Create a new shot object
			newShot = Instantiate( shot, thisTransform.position, thisTransform.rotation);
			
			//If the shot has a Shot script, set its valid target and target in range from this script
			if ( newShot.GetComponent(Shot) )
			{
				newShot.GetComponent(Shot).validTargets = validTargets;
			
				if ( newShot.GetComponent(Shot).homing )
				{
					if ( targetInRange )    
					{
						newShot.GetComponent(Shot).homingTarget = targetInRange;
					}
				}
			}
		}
	}
	
	newShot.gameObject.SetActive(false);
	
	yield WaitForSeconds(delay);
	
	newShot.gameObject.SetActive(true);
	
	isShooting = false;
	
	//If oneShot is true, Destroy this gameObject
	if ( oneShot )    Destroy(gameObject);
}