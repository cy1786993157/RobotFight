#pragma strict

var itemToDrop:Transform;

var dropChance:float = 0.1;

function DropItem()
{
	if ( Random.value <= dropChance )
	{ 
		Instantiate(itemToDrop, transform.position, Quaternion.identity);
	}
}