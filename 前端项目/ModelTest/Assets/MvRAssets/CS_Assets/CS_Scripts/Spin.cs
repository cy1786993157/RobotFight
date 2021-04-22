using UnityEngine;

namespace MvR
{
	/// <summary>
	/// A simple script to rotate an object at a certain speed.
	/// </summary>
	public class Spin : MonoBehaviour
	{
		public float rotateSpeed = 2;
	
		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			transform.eulerAngles = new Vector3(transform.eulerAngles.x, transform.eulerAngles.y + (rotateSpeed * Time.deltaTime));
		}
	}
}
