/*
 * Poker_Bot_BB.c
 *
 *  - Prompts for hole cards
 *  - Prompts for player position and current bet (in BB units) at each stage
 *  - Prompts user for flop, turn, and river cards
 *  - Evaluates hand strength (with high card, pair, suited, connectedness bonuses)
 *  - Recommends a play: fold, call, check, raise, or bluff (all in BB)
 *    and stops if the recommendation is to fold.
 *  - Allows for multiple raises by re-prompting if opponents re-raise.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

// Enumerations for suits and ranks
typedef enum { CLUBS, DIAMONDS, HEARTS, SPADES } Suit;
typedef enum { TWO = 2, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN,
               JACK = 11, QUEEN, KING, ACE = 14 } Rank;

// Card structure
typedef struct {
    Rank rank;
    Suit suit;
} Card;

// Parse input string (e.g., "Ah","Td") into Card struct
int parseCard(const char *str, Card *card) { //calling the structures for the function in main 
    if (strlen(str) < 2) return 0;
    char r = str[0];
    char s = str[strlen(str) - 1];
    // Rank (reading the input for card rank)
    if (r >= '2' && r <= '9')        card->rank = (Rank)(r - '0');//ranks everything as inputted
    else if (r == 'T' || r == 't')   card->rank = TEN;
    else if (r == 'J' || r == 'j')   card->rank = JACK;
    else if (r == 'Q' || r == 'q')   card->rank = QUEEN;
    else if (r == 'K' || r == 'k')   card->rank = KING;
    else if (r == 'A' || r == 'a')   card->rank = ACE;
    else return 0;
    // Suit (same for card suit)
    if (s == 'c' || s == 'C')        card->suit = CLUBS;
    else if (s == 'd' || s == 'D')   card->suit = DIAMONDS;
    else if (s == 'h' || s == 'H')   card->suit = HEARTS;
    else if (s == 's' || s == 'S')   card->suit = SPADES;
    else return 0;
    return 1;
}

// Returns a hand score: higher means better.
// Considers highest card, connectedness, suited bonus, and pair bonus.
int evaluateHand(const Card hole[2], const Card community[], int communityCount) {
    int r1 = hole[0].rank; //
    int r2 = hole[1].rank;
    int high = (r1 > r2) ? r1 : r2;
    int low  = (r1 < r2) ? r1 : r2;

    int score = high;//For example, if Ace - two offsuited is entered, we have a score of 14

    // Bonus for connected cards and pairs
    int gap = high - low;
    if (gap == 0) {
        score += 10; // Pair bonus (duh)
    } else if (gap == 1) {
        score += 5; // Direct connectors (6-7 would be stronger this way)
    } else if (gap == 2) {
        score += 5; // One-gap connectors ()
    }

    // Bonus for suited cards
    if (hole[0].suit == hole[1].suit) {
        score += 5;
    }
    return score;
}

// Suggests a raise size in BB (no chip conversion)
int getRaiseSize(int score) {
    if (score < 11) { // Weak hand
        return 1; // 1 BB
    } else if (score < 15) { // Decent
        return 3; // 3 BB
    } else if (score < 19) { // Strong
        return 8; // 8 BB
    } else { // Monster/all-in hands
        return 25; // 25 BB or more
    }
}

// Recommendation logic considering current bet in BB
// Returns 1 if recommendation is FOLD, otherwise 0.
int makeRecommendation(int strength, const char *stage, int currentBetBB) {
    printf("\n=== %s Recommendation ===\n", stage);
    printf("Current bet: %d BB\n", currentBetBB);
    int bluffChance = rand() % 100;

    if (currentBetBB == 0) {
        if (bluffChance < 5) {
            int raiseBB = getRaiseSize(strength);
            printf("The play is to BLUFF and RAISE %d BB!\n", raiseBB);
        }
        else if (strength >= ACE - 2) {
            int raiseBB = getRaiseSize(strength);
            printf("The play is to RAISE %d BB (strong hand)!\n", raiseBB);
        }
        else {
            printf("The play is to CHECK.\n");
        }
        return 0;
    } else {
        if (bluffChance < 5) {
            int raiseBB = getRaiseSize(strength);
            printf("The play is to BLUFF and RAISE to %d BB!\n", raiseBB);
        }
        else if (strength >= ACE - 2) {
            int raiseBB = getRaiseSize(strength);
            printf("The play is to RE-RAISE to %d BB!\n", raiseBB);
        }
        else if (strength >= TEN) {
            printf("The play is to CALL (match %d BB).\n", currentBetBB);
        }
        else {
            printf("The play is to FOLD (fold to %d BB).\n", currentBetBB);
            return 1;
        }
        return 0;
    }
}

// Handles a betting round: initial recommendation and any re-raises
// Returns 1 if player should fold, otherwise 0.
int handleBettingRound(const Card hole[2], const Card community[], int communityCount,
                       const char *stage) {
    int betUnitsBB, currentBetBB, strength;
    int shouldFold;
    char response;
    char buf[16];

    // Initial bet prompt (in BB)
    printf("Enter current bet (in big blinds, 0 to check): ");
    if (scanf("%d", &betUnitsBB) != 1) return 1;
    currentBetBB = betUnitsBB;

    // First recommendation
    strength = evaluateHand(hole, community, communityCount);
    shouldFold = makeRecommendation(strength, stage, currentBetBB);
    if (shouldFold) return 1;

    // Check for re-raises
    while (1) {
        printf("Did opponents re-raise? (y/n): ");
        scanf(" %c", &response);
        if (response == 'y' || response == 'Y') {
            printf("Enter new bet (in big blinds): ");
            if (scanf("%d", &betUnitsBB) != 1) return 1;
            currentBetBB = betUnitsBB;
            shouldFold = makeRecommendation(strength, stage, currentBetBB);
            if (shouldFold) return 1;
        } else if (response == 'n' || response == 'N') {
            break;
        } else {
            printf("Please enter 'y' or 'n'.\n");
        }
    }
    return 0;
}

int main() {
    Card hole[2], community[5]; // Structs for 2 cards (hand) and 5 cards (flop, turn, river)
    int communityCount;
    char position[16];//buffer for storing the position
    char buf[16];//buffer for storing the cards

    srand((unsigned)time(NULL)); // random pull for bluffing

    // Pre-flop: hole cards - for loop that gets info regarding the cards dealt
    for (int i = 0; i < 2; i++) {
        printf("Enter hole card %d (e.g. Ah, Td): ", i + 1);
        scanf("%15s", buf);//15 characters for the variable
        if (!parseCard(buf, &hole[i])) { printf("Invalid card.\n"); return 1; }//checks valid cards with if statement
    }
    // Prompt for position
    printf("Enter your position (SB, BB, UTG, BTN): ");
    scanf("%15s", position);

    if (handleBettingRound(hole, community, 0, "Pre-flop")) return 0;
    //Run the pre-flop betting round. If the player folded or game ends, stop the program here

    // Flop: 3 cards
    communityCount = 3;
    for (int i = 0; i < communityCount; i++) {
        printf("Enter flop card %d: ", i + 1);
        scanf("%15s", buf);
        if (!parseCard(buf, &community[i])) { printf("Invalid card.\n"); return 1; }
    }
    if (handleBettingRound(hole, community, communityCount, "Flop")) return 0;

    // Turn: 4th card
    communityCount = 4;
    printf("Enter turn card: ");
    scanf("%15s", buf);
    if (!parseCard(buf, &community[3])) { printf("Invalid card.\n"); return 1; }
    if (handleBettingRound(hole, community, communityCount, "Turn")) return 0;

    // River: 5th card
    communityCount = 5;
    printf("Enter river card: ");
    scanf("%15s", buf);
    if (!parseCard(buf, &community[4])) { printf("Invalid card.\n"); return 1; }
    if (handleBettingRound(hole, community, communityCount, "River")) return 0;

    printf("\nGame complete.\n");
    return 0;
}
