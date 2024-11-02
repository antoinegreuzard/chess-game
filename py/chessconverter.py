import chess.pgn
import json
from tqdm import tqdm


def convert_pgn_to_json(pgn_file, output_file, max_games=10000):
    games = []
    errors = []
    game_count = 0  # Compteur de parties

    with open(pgn_file, 'r') as pgn:
        with tqdm(desc="Conversion des parties") as progress_bar:
            while game_count < max_games:
                try:
                    game = chess.pgn.read_game(pgn)
                    if game is None:
                        break

                    game_data = {
                        "Event": game.headers.get("Event", ""),
                        "Site": game.headers.get("Site", ""),
                        "Date": game.headers.get("Date", ""),
                        "Round": game.headers.get("Round", ""),
                        "White": game.headers.get("White", ""),
                        "Black": game.headers.get("Black", ""),
                        "Result": game.headers.get("Result", ""),
                        "Moves": []
                    }

                    # Extraire les coups
                    node = game
                    while not node.is_end():
                        next_node = node.variation(0)
                        move = node.board().san(next_node.move)
                        game_data["Moves"].append(move)
                        node = next_node

                    games.append(game_data)
                    game_count += 1  # Incrémenter le compteur
                except Exception as e:
                    errors.append(str(e))

                progress_bar.update(1)  # Mettre à jour la barre de progression d'une unité

    # Enregistrer les parties converties dans un fichier JSON
    with open(output_file, 'w') as json_file:
        json.dump(games, json_file, indent=4)

    # Affichage des erreurs, s'il y en a
    if errors:
        print("\nDes erreurs ont été rencontrées lors de la conversion :")
        for error in errors:
            print(f"- {error}")
    else:
        print("\nConversion terminée sans erreurs.")


# Utilisation du script
pgn_file = 'chess.pgn'
output_file = 'games.json'
convert_pgn_to_json(pgn_file, output_file, max_games=1000)
