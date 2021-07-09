#version 410
 
uniform vec3 light_position;
uniform vec3 camera_position;
uniform vec3 diffuse;
uniform vec3 specular;
uniform vec3 ambient;
uniform float shininess;
uniform bool use_normal_mapping; 
uniform sampler2D diffuse_map;
uniform sampler2D normal_map;
uniform mat4 normal_model_to_world;

in VS_OUT {
	vec3 vertex;
	vec3 normal; 
	vec3 t;
	vec3 b;
	vec2 texCoord;
} fs_in;

out vec4 frag_color;
 
void main()
{
	vec3 color;
	vec3 reflect_vec; 
	vec3 L = normalize(light_position - fs_in.vertex); // Light vector 
	vec3 view_vector = normalize(camera_position - fs_in.vertex);

	if(use_normal_mapping){

// TBN martix to be used to transform the normal we read from the normal map
// from tangent space to model space.
		mat3 TBN = mat3(normalize(fs_in.t), normalize(fs_in.b), normalize(fs_in.normal));

// Remap from [0,1] to [-1,1] (Colors in GLSL: [0,1] instead of [0,255])
		vec3 normal = texture(normal_map, fs_in.texCoord).xyz * 2 - 1;

// Transform normal from object space to world space
		vec4 normal_to_world = normal_model_to_world * vec4(TBN * normal, 0.0f);
		normal = normalize(normal_to_world.xyz);

		reflect_vec = reflect(-L, normal); // New reflect vector
		 
		vec3 diffuse = texture(diffuse_map, fs_in.texCoord).rgb; // Map texture 
		color = ambient + diffuse * max( dot(normal, L), 0.0f) + specular *
		pow( max( dot(reflect_vec, view_vector), 0.0), shininess);

	} else{
// color = AmbientColor + DiffuseColor * n dotprod L
// + SpecularColor * (reflect(-L, n) dotprod V)^shininess factor 
		 
		vec3 normal = normalize(fs_in.normal); // Normal vector n
		reflect_vec = reflect(-L, normal); // Reflect vector

// Apply max(a, b) before dot products to avoid negative values

		color = ambient + diffuse * max( dot(normal, L), 0.0) + specular * 
		pow( max( dot(reflect_vec, view_vector), 0.0 ), shininess);
	} 
		frag_color = vec4(color, 1.0);
}
