/*This script handles enemy behaviour, moving and attacking valid targets. It also kills the enemy when its health reaches 0*/

#pragma strict

//Caching the transform for quicker access
private var thisTransform:Transform;
private var gameController:GameObject;

//Enemy basic attributes
var speed:float = 0.2;
var health:int = 100;
private var healthMax:float;

//Enemy parts that fall off as it loses health
var parts:Transform[];
private var partHealth:int;
private var partsLeft:int;

//The range from which a target can be detected
var range:float = 2;

//How many extra range lanes to create sideways
var lanesRange:int = 1;

//The gap between the extra range lanes
var lanesGap:float = 1;

//The offset of the entire weapon range scheme
var lanesOffset:Vector2 = Vector2(0,0);

//Delay between attacks
var attackDelay:float = 2;
private var attackDelayCount:float = 0;

//Damage per attack
var damage:float = 10;

//Current attack target
private var attackTarget:Transform;

//A list of valid targets for the enemy
var validTargets:LayerMask;

//Suicide damage caused when the enemy touches a target
var kamikaze:int = 0;

//Effect created when a unit dies
var deathEffect:Transform;

//The lane this enemy belongs to
internal var lane:Transform;

//The sticky that is attached to this enemy
internal var sticky:Transform;

//An object which, if reached, will in the game in a Loss
var defeatLine:Transform;

//If this enemy dead?
private var dead:boolean = false;

//Various sounds for the enemy
var soundAttack:AudioClip;
var soundDie:AudioClip;

//General use index
private var index:int;

//Animation clips for Walk, Attack, Die
var walkAnimation:AnimationClip;
var attackAnimation:AnimationClip;
var dieAnimation:AnimationClip;

//How many seconds to wait before issuing the attack ( damage, sound effect, etc )
var attackAnimationTime:float = 0;

//Is the enemy attacking right now?
private var isAttacking:boolean = false;

//A list of droppable items with their drop chance
var itemDrops:ItemChance[];

class ItemChance
{
	var itemToDrop:Transform;
	var dropChance:float = 0.1;
}


function Start() 
{
	thisTransform = transform; //Caching transform for quicker access
	
	//Caching the gamecontroller for later use
	gameController = GameObject.FindGameObjectWithTag("GameController");
	
	healthMax = health;
	
	//Calculate the health for each part of the enemy
	partHealth = health/(parts.Length + 1);
	partsLeft = parts.Length;
}

function Update() 
{
	if ( health > 0 )
	{
		//If the enemy has no target, look for the closest one and set it as the current target.
		if ( attackTarget == null )
		{
			var hit:RaycastHit;
			
			//Go through the range scheme and check hits with valid targets
			for ( index = 0 ; index < lanesRange ; index++ )
			{
				if ( Physics.Raycast( thisTransform.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + Vector3(index * lanesGap, 0.1, 0), thisTransform.forward, hit, range, validTargets) || Physics.Raycast( thisTransform.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + Vector3(index * -lanesGap, 0.1, 0), thisTransform.forward, hit, range, validTargets) )
	        	{
	        		//Set the object we detected as the target in range
	        		attackTarget = hit.collider.transform;
	        		
	        		return;
	        	}
	    	}
			
			if ( animation )    
			{
				if ( walkAnimation )
				{
					if ( animation[walkAnimation.name] )
					{
						if ( !animation.isPlaying )
					    {
					    	animation.Play(walkAnimation.name);
						}
					}
				}
				else
				{
					if ( !animation.isPlaying )
				    {
				    	animation.Play("walk");
					}
				}
			}
			
			//Move forward based on speed
			thisTransform.Translate(Vector3.forward * speed * Time.deltaTime, Space.Self);
		}
		
		//If the enemy's health drops below the part health, remove that part
		if ( partsLeft > 0 && health <= partsLeft * partHealth )
		{
			partsLeft--;
			
			//Remove the correct part if it's available
			if ( parts[partsLeft] )
			{
				//If the part has a Gib script, run it
				if ( parts[partsLeft].GetComponent(Gib) )
				{
					parts[partsLeft].GetComponent(Gib).enabled = true;
					
					parts[partsLeft].GetComponent(Gib).lane = lane;
				}
				else //Otherwise, destroy it
				{
					Destroy(parts[partsLeft].gameObject);
				}
				
				parts[partsLeft].transform.parent = null;
			}
		}
		
		//Make the enemy attack its target with a delay
		if ( attackDelay > 0 || kamikaze > 0 )
		{
		   	if ( isAttacking == false )
		   	{
			    if ( attackDelayCount < attackDelay )
			    {
			    	attackDelayCount += Time.deltaTime;
			    }
			    else if ( attackTarget ) //If there is a valid target, attack it
			    {
			    	attackDelayCount = 0;
					
					Attack(attackAnimationTime);
					
					if ( animation )    
					{
						if ( attackAnimation )
						{
							if ( animation[attackAnimation.name] )
							{
								animation.Play(attackAnimation.name);
							}
						}
						else if ( animation["attack"] )
						{
							animation.Play("attack");
						}
					}
				}
		    }
		    
		    if ( !animation.isPlaying )    attackTarget = null;
		}
    }
    else if ( dead == false )   //If health is 0 or less, remove the object
    {
    	Die();
    }
}

//This function attacks the target, reducing damage
function Attack( delay:float )
{
	isAttacking = true;
	
	yield WaitForSeconds(delay);
	
	if ( kamikaze <= 0 )
	{
		if ( attackTarget )    if ( attackTarget.GetComponent(Building) )    attackTarget.GetComponent(Building).health -= damage;
	}
	else //Else, set its health to 0 and reduce kamikaze damage from the target
	{
		if ( attackTarget )    if ( attackTarget.GetComponent(Building) )    attackTarget.GetComponent(Building).health -= kamikaze;
		
		health = 0;
	}

	if ( soundAttack )    audio.PlayOneShot(soundAttack);
	
	isAttacking = false;
}

//This function runs when an enemy dies
function Die()
{
	dead = true;
    
    //Play a death sound	
	if ( audio )    if ( soundDie )    audio.PlayOneShot(soundDie);

	//Disable the collider
	collider.enabled = false;
	
	//Play the death animation, and wait for it to be over
//	if ( animation.GetClip("die") )    
//	{
//		animation.Play("die");
//	
//		yield WaitForSeconds(animation.GetClip("die").length);
//	}
	
	if ( animation )    
	{
		if ( dieAnimation )
		{
			if ( animation.GetClip(dieAnimation.name) )    
			{
				animation.Play(dieAnimation.name);
			
				yield WaitForSeconds(animation.GetClip(dieAnimation.name).length);
			}
		}
		else if ( animation.GetClip("die") )    
		{
			animation.Play("die");
		
			yield WaitForSeconds(animation.GetClip("die").length);
		}
	}
	
	DropItem();
	
	//Destroy this object
	Destroy(gameObject); //Remove this shot from the game
	
	//Create a death effect, if available
	if ( deathEffect )    
	{
		var newEffect:Transform = Instantiate( deathEffect, thisTransform.position, Quaternion.identity);
		
		if ( newEffect.GetComponent(Shot) )    newEffect.GetComponent(Shot).validTargets = validTargets;
	}
	
	//Add to the number killed enemies
	gameController.GetComponent(EnemyDispenser).enemiesKilled++;
}

//This function drops items based on a chance
function DropItem()
{
	for ( var singleItem in itemDrops )
	{
		//If an item is assigned, proceed
		if ( singleItem.itemToDrop )
		{
			//If the drop chance of an item is smaller than a random number between 0 and 1
			if ( Random.value <= singleItem.dropChance )
			{ 
				//Create the item drop
				Instantiate(singleItem.itemToDrop, transform.position, Quaternion.identity);
			}
		}
	}
}

//Draw gizmo lines corresponding to the full range scheme of the Enemy
function OnDrawGizmos() 
{
        Gizmos.color = Color.red;
        
        
        for ( index = 0 ; index < lanesRange ; index++ )
        {
			var direction = transform.TransformDirection(transform.forward) * range;
			        
	    	var position = transform.right * lanesGap * index;
	    	
	    	Gizmos.DrawRay( transform.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
	    	
	    	position = transform.right * -lanesGap * index;
	    	
	    	Gizmos.DrawRay( transform.position + Vector3(lanesOffset.y, 0, lanesOffset.x) + position, direction);
    	}
}

var guiSkin:GUISkin;

//The camera position
private var cameraPosition:Vector3;

//The relative healthbar position
var healthBarPosition:Rect;

//Draw a health bar relative to the building, which is visible when you hold 'H' key
function OnGUI()
{
	GUI.skin = guiSkin;
	
	if ( guiSkin )
	{
		if ( Input.GetKey(KeyCode.H) )
		{
			//If health is larger than 0, display a health bar on the building
			if ( health >= 0 )
			{
				cameraPosition = Camera.main.WorldToScreenPoint(thisTransform.position);
				
				cameraPosition.y = Screen.height - (cameraPosition.y - 50);
				
				GUI.Box( Rect( cameraPosition.x - healthBarPosition.x, cameraPosition.y - healthBarPosition.y, healthBarPosition.width, healthBarPosition.height), health.ToString() + "/" + healthMax.ToString(), "Healthbar Red" );
				
				GUI.Box( Rect( cameraPosition.x - healthBarPosition.x, cameraPosition.y - healthBarPosition.y, (health/healthMax) * healthBarPosition.width, healthBarPosition.height), "", "Healthbar Green" );
			}
		}
	}
}


function OnTriggerEnter(other:Collider)
{
	//If this enemy collides with the Defeat Line, it's game over
	if ( other.name == defeatLine.name )
	{
		if ( gameController.GetComponent(EnemyDispenser).lose == false )    gameController.GetComponent(EnemyDispenser).Lose();
	}
}

