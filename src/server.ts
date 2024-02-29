import http, { IncomingMessage, ServerResponse } from "http"; // TypeScript Import
const hostname = "127.0.0.1"; // or 'localhost'
const port = 3000;

interface Pokemon {
	id: number;
	name: string;
	type: string;
}

const party: Pokemon[] = [{ id: 1, name: "Pikachu", type: "Electric" }];

const server = http.createServer(
	(req: IncomingMessage, res: ServerResponse) => {
		if (req.method === "GET" && req.url === "/") {
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.end(
				JSON.stringify(
					{
						message: "Hello from the Pokemon Server!",
					},
					null,
					2,
				),
			);
		} else if (req.method === "GET" && req.url?.startsWith("/pokemon/")) {
			// Find Pokemon by ID
			const urlParts = req.url.split("/");
			const pokemonId = parseInt(urlParts[2]);

			const foundPokemon = party.find(
				(pokemon) => pokemon.id === pokemonId,
			);

			if (foundPokemon) {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.end(
					JSON.stringify(
						{
							message: "Pokemon found",
							payload: foundPokemon,
						},
						null,
						2,
					),
				);
			} else {
				res.statusCode = 404;
				res.end(
					JSON.stringify({ message: "Pokemon not found" }, null, 2),
				);
			}
		} else if (req.method === "GET" && req.url === "/pokemon") {
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.end(
				JSON.stringify(
					{ message: "All Pokemon", payload: party },
					null,
					2,
				),
			);
		} else if (req.method === "POST" && req.url === "/pokemon") {
			let body = ""; // To store incoming data
			req.on("data", (chunk) => {
				body += chunk.toString();
			});

			req.on("end", () => {
				const newPokemon = JSON.parse(body);

				// Add basic data logic (you'd likely use a database in a real application)
				newPokemon.id = party.length + 1; // Simple ID assignment
				party.push(newPokemon);

				res.statusCode = 201; // 'Created'
				res.setHeader("Content-Type", "application/json");
				res.end(
					JSON.stringify(
						{
							message: "Pokemon created!",
							payload: newPokemon,
						},
						null,
						2,
					),
				);
			});
		} else if (req.method === "PUT" && req.url?.startsWith("/pokemon/")) {
			const urlParts = req.url.split("/");
			const pokemonId = parseInt(urlParts[2]); // Assume ID in the URL

			let body = "";
			req.on("data", (chunk) => {
				body += chunk.toString();
			});

			req.on("end", () => {
				const updatedPokemon = JSON.parse(body);

				const foundIndex = party.findIndex((p) => p.id === pokemonId);
				if (foundIndex !== -1) {
					party[foundIndex] = {
						...party[foundIndex],
						...updatedPokemon,
					};
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.end(
						JSON.stringify(
							{
								message: "Pokemon updated!",
								payload: party[foundIndex],
							},
							null,
							2,
						),
					);
				} else {
					res.statusCode = 404;
					res.end(
						JSON.stringify(
							{ message: "Pokemon not found" },
							null,
							2,
						),
					);
				}
			});
		} else if (
			req.method === "DELETE" &&
			req.url?.startsWith("/pokemon/")
		) {
			const urlPath = req.url.split("/");
			const pokemonId = +urlPath[2]; // Extract ID from the URL

			const foundIndex = party.findIndex((p) => p.id === pokemonId);
			if (foundIndex !== -1) {
				const deletedPokemon = party.splice(foundIndex, 1); // Remove the Pokemon
				res.statusCode = 200;
				res.end(
					JSON.stringify(
						{ message: "Pokemon deleted", payload: deletedPokemon },
						null,
						2,
					),
				);
			} else {
				res.statusCode = 404;
				res.end(
					JSON.stringify({ message: "Pokemon not found" }, null, 2),
				);
			}
		}
	},
);

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
