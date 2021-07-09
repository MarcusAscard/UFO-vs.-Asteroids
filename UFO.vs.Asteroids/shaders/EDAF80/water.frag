#version 410
 
uniform vec3 light_position;
uniform vec3 camera_position;
uniform sampler2D normal_map;  
uniform samplerCube my_cube_map;
uniform float ellapsed_time_s;
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
	vec3 color_deep = vec3(0.0, 0.0, 0.1);
	vec3 color_shallow = vec3(0.0, 0.5, 0.5);
	vec3 view_vector = normalize(camera_position - fs_in.vertex); 

	// TBN martix to be used to transform the normal we read from the normal map
	// from tangent space to model space.
	mat3 TBN = mat3(normalize(fs_in.t), normalize(fs_in.b), normalize(fs_in.normal)); 

	vec2 texScale = vec2(8,4);
	float normalTime = mod(ellapsed_time_s, 100.0);
	vec2 normalSpeed = vec2(-0.05, 0);

	vec2 normalCoord0_xy = fs_in.texCoord.xy*texScale + normalTime * normalSpeed;
	vec2 normalCoord1_xy = fs_in.texCoord.xy*texScale * 2 + normalTime * normalSpeed * 4;
	vec2 normalCoord2_xy = fs_in.texCoord.xy*texScale * 4 + normalTime * normalSpeed * 8;

	vec4 n_0 = texture(normal_map, normalCoord0_xy) * 2 - 1;
	vec4 n_1 = texture(normal_map, normalCoord1_xy) * 2 - 1;
	vec4 n_2 = texture(normal_map, normalCoord2_xy) * 2 - 1;
	vec4 n_bump = normalize(n_0 + n_1 + n_2);
	vec3 n_bump_world = (normal_model_to_world * vec4(TBN  * n_bump.xyz, 0)).xyz;
	

	
	float facing = 1 - max(dot(view_vector, n_bump_world), 0);
	vec3 color_water = mix(color_deep, color_shallow, facing); 
	vec3 reflect_vec = texture(my_cube_map, reflect(-view_vector, n_bump_world)).rgb;

	float R_0 = 0.02037;
	float fresnel = R_0 + (1 - R_0) * pow(1 - dot(view_vector, n_bump_world), 5);

	vec3 refract_vec = texture(my_cube_map, refract(-view_vector, n_bump_world, 1.0 / 1.33)).rgb;

	vec4 result = vec4(color_water + reflect_vec * fresnel + refract_vec * (1 - fresnel), 0);
	 
	frag_color = result;
}
